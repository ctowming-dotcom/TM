(function () {
  window.TM = window.TM || {};

  var KEYS = {
    apiKey: 'tm.apiKey',
    decks: 'tm.decks',
    quizAttempts: 'tm.quizAttempts',
  };

  function getApiKey() {
    return localStorage.getItem(KEYS.apiKey) || '';
  }
  function setApiKey(key) {
    localStorage.setItem(KEYS.apiKey, key);
  }
  function clearApiKey() {
    localStorage.removeItem(KEYS.apiKey);
  }

  function getDecks() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.decks)) || [];
    } catch (err) {
      return [];
    }
  }
  function saveDecks(decks) {
    localStorage.setItem(KEYS.decks, JSON.stringify(decks));
  }

  function getQuizAttempts(quizId) {
    var all;
    try {
      all = JSON.parse(localStorage.getItem(KEYS.quizAttempts)) || [];
    } catch (err) {
      all = [];
    }
    return quizId ? all.filter(function (a) { return a.quizId === quizId; }) : all;
  }
  function saveQuizAttempt(attempt) {
    var all = getQuizAttempts();
    all.push(attempt);
    localStorage.setItem(KEYS.quizAttempts, JSON.stringify(all));
  }

  window.TM.storage = {
    getApiKey: getApiKey,
    setApiKey: setApiKey,
    clearApiKey: clearApiKey,
    getDecks: getDecks,
    saveDecks: saveDecks,
    getQuizAttempts: getQuizAttempts,
    saveQuizAttempt: saveQuizAttempt,
  };
})();
