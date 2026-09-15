(function () {
  var QUIZ_ID = 'web-basics';

  function mount(container) {
    var questions = (window.TM.quizQuestions && window.TM.quizQuestions[QUIZ_ID]) || [];
    var current = 0;
    var score = 0;

    render();

    function render() {
      if (questions.length === 0) {
        container.innerHTML = '<p class="error">No quiz questions available.</p>';
        return;
      }
      if (current >= questions.length) {
        renderResults();
        return;
      }

      var q = questions[current];
      container.innerHTML =
        '<div class="quiz">' +
        '<p class="quiz-progress">Question ' + (current + 1) + ' of ' + questions.length + '</p>' +
        '<h2 class="quiz-question">' + TM.escapeHtml(q.question) + '</h2>' +
        '<div class="quiz-choices" role="radiogroup">' +
        q.choices.map(function (choice, i) {
          return '<button type="button" class="quiz-choice" data-index="' + i + '">' + TM.escapeHtml(choice) + '</button>';
        }).join('') +
        '</div>' +
        '<p class="quiz-feedback" hidden></p>' +
        '<button type="button" class="quiz-next" hidden>Next</button>' +
        '</div>';

      var answered = false;
      var choiceButtons = container.querySelectorAll('.quiz-choice');
      var feedback = container.querySelector('.quiz-feedback');
      var nextButton = container.querySelector('.quiz-next');

      choiceButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (answered) return;
          answered = true;
          var chosen = Number(btn.dataset.index);
          var correct = chosen === q.answerIndex;
          if (correct) score++;
          choiceButtons.forEach(function (b) {
            b.disabled = true;
            var idx = Number(b.dataset.index);
            if (idx === q.answerIndex) b.classList.add('correct');
            else if (idx === chosen) b.classList.add('incorrect');
          });
          feedback.hidden = false;
          feedback.textContent = (correct ? 'Correct! ' : 'Not quite. ') + q.explanation;
          nextButton.hidden = false;
        });
      });

      nextButton.addEventListener('click', function () {
        current++;
        render();
      });
    }

    function renderResults() {
      TM.storage.saveQuizAttempt({
        quizId: QUIZ_ID,
        score: score,
        total: questions.length,
        completedAt: new Date().toISOString(),
      });
      var history = TM.storage.getQuizAttempts(QUIZ_ID).slice().reverse();

      container.innerHTML =
        '<div class="quiz-results">' +
        '<h2>Score: ' + score + ' / ' + questions.length + '</h2>' +
        '<button type="button" class="quiz-retry">Try again</button>' +
        '<h3>Past attempts</h3>' +
        '<ul class="quiz-history">' +
        (history.length === 0
          ? '<li class="empty">No previous attempts.</li>'
          : history.map(function (a) {
              return '<li>' + a.score + '/' + a.total + ' — ' + new Date(a.completedAt).toLocaleString() + '</li>';
            }).join('')) +
        '</ul>' +
        '</div>';

      container.querySelector('.quiz-retry').addEventListener('click', function () {
        current = 0;
        score = 0;
        render();
      });
    }
  }

  window.TM.registerTool('quiz-generator', { mount: mount });
})();
