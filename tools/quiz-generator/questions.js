(function () {
  window.TM = window.TM || {};
  window.TM.quizQuestions = window.TM.quizQuestions || {};

  window.TM.quizQuestions['web-basics'] = [
    {
      question: 'What does HTML stand for?',
      choices: [
        'Hyper Trainer Marking Language',
        'HyperText Markup Language',
        'Hyper Text Machine Language',
        'Home Tool Markup Language',
      ],
      answerIndex: 1,
      explanation: 'HTML stands for HyperText Markup Language — it structures content on the web.',
    },
    {
      question: 'Which HTML tag defines an unordered list?',
      choices: ['<ol>', '<ul>', '<li>', '<list>'],
      answerIndex: 1,
      explanation: '<ul> creates an unordered (bulleted) list; <li> defines each item inside it.',
    },
    {
      question: "Which CSS property changes an element's text color?",
      choices: ['font-color', 'text-color', 'color', 'foreground-color'],
      answerIndex: 2,
      explanation: 'The color property sets the color of text content.',
    },
    {
      question: 'Which HTML attribute specifies alternate text for an image?',
      choices: ['title', 'src', 'alt', 'longdesc'],
      answerIndex: 2,
      explanation: 'The alt attribute provides alternate text for screen readers and for when the image fails to load.',
    },
    {
      question: 'Which CSS selector targets an element with a specific id?',
      choices: ['.id', '#id', '*id', '$id'],
      answerIndex: 1,
      explanation: 'A # prefix selects an element by its id attribute; . is for classes.',
    },
    {
      question: 'What does "box-sizing: border-box" do?',
      choices: [
        "Includes padding and border inside the element's declared width/height",
        'Removes all borders',
        'Hides the box shadow',
        'Adds margin automatically',
      ],
      answerIndex: 0,
      explanation: "With border-box, padding and border are included in the element's declared width and height, instead of adding to it.",
    },
    {
      question: "Which JavaScript keyword declares a variable that can't be reassigned?",
      choices: ['var', 'let', 'const', 'static'],
      answerIndex: 2,
      explanation: 'const declares a block-scoped variable whose binding cannot be reassigned.',
    },
    {
      question: 'Which method attaches an event listener to a DOM element?',
      choices: ['element.addEventListener()', 'element.onEvent()', 'element.listen()', 'element.attachEvent()'],
      answerIndex: 0,
      explanation: 'addEventListener() registers a function to run when a specified event occurs on the element.',
    },
    {
      question: "What's the correct way to link an external stylesheet in HTML?",
      choices: [
        '<css src="style.css">',
        '<link rel="stylesheet" href="style.css">',
        '<style src="style.css">',
        '<import href="style.css">',
      ],
      answerIndex: 1,
      explanation: 'The <link> tag with rel="stylesheet" loads an external CSS file into the page.',
    },
    {
      question: 'Which correctly saves a value to localStorage?',
      choices: [
        "localStorage.set('key', 'value')",
        "localStorage.save('key', 'value')",
        "localStorage.setItem('key', 'value')",
        "localStorage.put('key', 'value')",
      ],
      answerIndex: 2,
      explanation: 'localStorage.setItem(key, value) stores a string value under the given key in the browser.',
    },
  ];
})();
