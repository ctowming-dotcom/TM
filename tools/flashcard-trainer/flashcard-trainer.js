(function () {
  var MODEL = 'claude-haiku-4-5-20251001';

  function mount(container) {
    var decks = TM.storage.getDecks();
    var view = 'list';
    var activeDeckId = null;
    var drillIndex = 0;
    var drillFlipped = false;

    render();

    function persist() {
      TM.storage.saveDecks(decks);
    }
    function findDeck(id) {
      return decks.find(function (d) { return d.id === id; });
    }

    function render() {
      if (view === 'list') renderList();
      else if (view === 'new') renderNew();
      else if (view === 'detail') renderDetail();
      else if (view === 'drill') renderDrill();
    }

    function renderList() {
      container.innerHTML =
        '<div class="flashcards">' +
        '<div class="flashcards-header">' +
        '<h2>Your decks</h2>' +
        '<button type="button" class="btn-new-deck">+ New deck</button>' +
        '</div>' +
        (decks.length === 0
          ? '<p class="empty">No decks yet. Create one to get started.</p>'
          : '<ul class="deck-list">' +
            decks.map(function (d) {
              return (
                '<li class="deck-item">' +
                '<div>' +
                '<strong>' + TM.escapeHtml(d.topic) + '</strong>' +
                '<span class="deck-meta">' + d.cards.length + ' card' + (d.cards.length === 1 ? '' : 's') + ' · ' + d.source + '</span>' +
                '</div>' +
                '<div class="deck-actions">' +
                '<button type="button" class="btn-study" data-id="' + d.id + '">Study</button>' +
                '<button type="button" class="btn-edit" data-id="' + d.id + '">Edit</button>' +
                '<button type="button" class="btn-delete" data-id="' + d.id + '">Delete</button>' +
                '</div>' +
                '</li>'
              );
            }).join('') +
            '</ul>') +
        '</div>';

      container.querySelector('.btn-new-deck').addEventListener('click', function () {
        view = 'new';
        render();
      });
      container.querySelectorAll('.btn-study').forEach(function (b) {
        b.addEventListener('click', function () {
          activeDeckId = b.dataset.id;
          drillIndex = 0;
          drillFlipped = false;
          view = 'drill';
          render();
        });
      });
      container.querySelectorAll('.btn-edit').forEach(function (b) {
        b.addEventListener('click', function () {
          activeDeckId = b.dataset.id;
          view = 'detail';
          render();
        });
      });
      container.querySelectorAll('.btn-delete').forEach(function (b) {
        b.addEventListener('click', function () {
          decks = decks.filter(function (d) { return d.id !== b.dataset.id; });
          persist();
          render();
        });
      });
    }

    function renderNew() {
      container.innerHTML =
        '<div class="flashcards-new">' +
        '<button type="button" class="btn-back-list">← Back to decks</button>' +
        '<h2>New deck</h2>' +
        '<label for="fc-topic">Topic</label>' +
        '<input type="text" id="fc-topic" placeholder="e.g. Photosynthesis">' +
        '<div class="new-deck-actions">' +
        '<button type="button" class="btn-generate">Generate with AI</button>' +
        '<button type="button" class="btn-blank">Start blank</button>' +
        '</div>' +
        '<p class="fc-status" hidden></p>' +
        '</div>';

      container.querySelector('.btn-back-list').addEventListener('click', function () {
        view = 'list';
        render();
      });

      container.querySelector('.btn-blank').addEventListener('click', function () {
        var topic = container.querySelector('#fc-topic').value.trim() || 'Untitled deck';
        var deck = { id: crypto.randomUUID(), topic: topic, source: 'manual', createdAt: new Date().toISOString(), cards: [] };
        decks.push(deck);
        persist();
        activeDeckId = deck.id;
        view = 'detail';
        render();
      });

      container.querySelector('.btn-generate').addEventListener('click', function () {
        var topic = container.querySelector('#fc-topic').value.trim();
        var status = container.querySelector('.fc-status');
        if (!topic) {
          status.hidden = false;
          status.textContent = 'Enter a topic first.';
          return;
        }
        var apiKey = TM.storage.getApiKey();
        if (!apiKey) {
          status.hidden = false;
          status.textContent = 'Add your Anthropic API key in Settings first.';
          return;
        }
        status.hidden = false;
        status.textContent = 'Generating…';

        generateCards(topic, apiKey).then(function (cards) {
          var deck = { id: crypto.randomUUID(), topic: topic, source: 'ai', createdAt: new Date().toISOString(), cards: cards };
          decks.push(deck);
          persist();
          activeDeckId = deck.id;
          view = 'detail';
          render();
        }).catch(function (err) {
          console.error(err);
          status.textContent = "Couldn't generate cards — check your API key and try again.";
        });
      });
    }

    function renderDetail() {
      var deck = findDeck(activeDeckId);
      if (!deck) {
        view = 'list';
        render();
        return;
      }

      container.innerHTML =
        '<div class="flashcards-detail">' +
        '<button type="button" class="btn-back-list">← Back to decks</button>' +
        '<h2>' + TM.escapeHtml(deck.topic) + '</h2>' +
        '<ul class="card-list">' +
        (deck.cards.length === 0
          ? '<p class="empty">No cards yet — add one below.</p>'
          : deck.cards.map(function (c, i) {
              return (
                '<li class="card-item">' +
                '<div><strong>Front:</strong> ' + TM.escapeHtml(c.front) + '</div>' +
                '<div><strong>Back:</strong> ' + TM.escapeHtml(c.back) + '</div>' +
                '<button type="button" class="btn-remove-card" data-index="' + i + '">Remove</button>' +
                '</li>'
              );
            }).join('')) +
        '</ul>' +
        '<form class="add-card-form">' +
        '<input type="text" name="front" placeholder="Front" required>' +
        '<input type="text" name="back" placeholder="Back" required>' +
        '<button type="submit">Add card</button>' +
        '</form>' +
        '<button type="button" class="btn-study"' + (deck.cards.length ? '' : ' disabled') + '>Study this deck</button>' +
        '</div>';

      container.querySelector('.btn-back-list').addEventListener('click', function () {
        view = 'list';
        render();
      });
      container.querySelector('.btn-study').addEventListener('click', function () {
        drillIndex = 0;
        drillFlipped = false;
        view = 'drill';
        render();
      });
      container.querySelectorAll('.btn-remove-card').forEach(function (b) {
        b.addEventListener('click', function () {
          deck.cards.splice(Number(b.dataset.index), 1);
          persist();
          render();
        });
      });
      container.querySelector('.add-card-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var form = e.target;
        var front = form.front.value.trim();
        var back = form.back.value.trim();
        if (!front || !back) return;
        deck.cards.push({ id: crypto.randomUUID(), front: front, back: back });
        persist();
        render();
      });
    }

    function renderDrill() {
      var deck = findDeck(activeDeckId);
      if (!deck || deck.cards.length === 0) {
        view = 'list';
        render();
        return;
      }
      var card = deck.cards[drillIndex];

      container.innerHTML =
        '<div class="flashcards-drill">' +
        '<button type="button" class="btn-back-detail">← Back to deck</button>' +
        '<p class="drill-progress">Card ' + (drillIndex + 1) + ' of ' + deck.cards.length + '</p>' +
        '<div class="flip-card" tabindex="0" role="button" aria-label="Flip card">' +
        '<p class="flip-card-label">' + (drillFlipped ? 'Back' : 'Front') + '</p>' +
        '<p class="flip-card-content">' + TM.escapeHtml(drillFlipped ? card.back : card.front) + '</p>' +
        '</div>' +
        '<div class="drill-actions">' +
        '<button type="button" class="btn-prev"' + (drillIndex === 0 ? ' disabled' : '') + '>Prev</button>' +
        '<button type="button" class="btn-flip">Flip</button>' +
        '<button type="button" class="btn-next"' + (drillIndex === deck.cards.length - 1 ? ' disabled' : '') + '>Next</button>' +
        '</div>' +
        '</div>';

      container.querySelector('.btn-back-detail').addEventListener('click', function () {
        view = 'detail';
        render();
      });

      function flip() {
        drillFlipped = !drillFlipped;
        render();
      }

      var flipCard = container.querySelector('.flip-card');
      flipCard.addEventListener('click', flip);
      flipCard.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          flip();
        }
      });
      container.querySelector('.btn-flip').addEventListener('click', flip);
      container.querySelector('.btn-prev').addEventListener('click', function () {
        drillIndex--;
        drillFlipped = false;
        render();
      });
      container.querySelector('.btn-next').addEventListener('click', function () {
        drillIndex++;
        drillFlipped = false;
        render();
      });
    }
  }

  function generateCards(topic, apiKey) {
    var prompt =
      'Create a flashcard deck for a student studying "' + topic + '". ' +
      'Return ONLY a valid JSON array (no markdown formatting, no code fences, no extra text) ' +
      'of 8 objects, each with exactly two string fields: "front" (a question or term) and ' +
      '"back" (the answer or definition). Keep each side concise (under 25 words).';

    return fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    }).then(function (res) {
      if (!res.ok) throw new Error('Anthropic API error: ' + res.status);
      return res.json();
    }).then(function (data) {
      var text = (data.content && data.content[0] && data.content[0].text) || '';
      var jsonText = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
      var parsed = JSON.parse(jsonText);
      return parsed.map(function (c) {
        return { id: crypto.randomUUID(), front: String(c.front), back: String(c.back) };
      });
    });
  }

  window.TM.registerTool('flashcard-trainer', { mount: mount });
})();
