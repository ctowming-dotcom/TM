(function () {
  window.TM = window.TM || {};

  var KEYS = {
    quizAttempts: 'tm.quizAttempts',
  };

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
    getQuizAttempts: getQuizAttempts,
    saveQuizAttempt: saveQuizAttempt,
  };
})();
