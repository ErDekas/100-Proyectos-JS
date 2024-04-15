const quizContainer = document.getElementById('quiz');
const resultsContainer = document.getElementById('results');
const submitButton = document.getElementById('submit');
const restartButton = document.getElementById('restart');

const myQuestions = [
   
      {
        question: "¿Por qué el agua del mar es salada?",
        answers: {
            a: "Es salada por la concentración de sales minerales disueltas que contiene",
            b: "Es salada por el pis de los animales del mar",
            c: "Es salada por su temperatura"
        },
        correctAnswer: "a"
    },
   {
        question: "¿Qué fue primero el huevo o la gallina?",
        answers: {
            a: "El huevo",
            b: "La gallina",
            c: "Mi madre"
        },
        correctAnswer: "a"
    },
  
    {
    question: "¿Cuál es la capital de España?",
    answers: {
      a: "Madrid",
      b: "Sevilla",
      c: "Barcelona"
},correctAnswer: "a"
    },
  
   {
    question: "¿Cúantos continentes hay en el mundo?",
    answers: {
      a: "5",
      b: "7",
      c: "6"
    }, correctAnswer: "a"

     },
  
    {
    question: "¿Cúal es el gas que necesita el humano para vivir?",
    answers: {
      a: "Oxígeno",
      b: "Dióxido de carbono",
      c: "Azufre"
    },
    correctAnswer: "a",
  },
  
  {
    question: "¿Qué es una marca?",
    answers: {
      a: "Un logotipo",
      b: "Un producto",
      c: "Un conjunto de asociaciones que las personas hacen con una empresa, producto o servicio"
    },correctAnswer: "c",
  },

  
  {
  question: "¿En qué año comenzó la 2da Guerra Mundial?",
  answers: {
    a: "1932",
    b: "1939",
    c: "1945"
  },
    correctAnswer: "b"
},
  
{
  question: "¿Cuál es el propósito principal de la investigación de mercado?",
  answers: {
    a: "Obtener información sobre la competencia",
    b: "Conocer las necesidades y deseos de los clientes",
    c: "Promocionar productos y servicios"
  },
  correctAnswer: "b"
},
  
{
  question: "¿Cual es la forma de publicidad más utilizada en el mundo?",
  answers: {
    a: "Campanas publicitarias",
    b: "Anuncios publicitarios",
    c: "Correos publicitarios"
  },
  correctAnswer: "a"
},
  
{
  question: "¿Cúal es el manga más vendido en el mundo?",
  answers: {
    a: "Naruto",
    b: "Bleach",
    c: "One Piece"
  },
  correctAnswer: "c"
},
  {
  question: "¿Cuál es la consola más vendida en el mundo?",
  answers: {
    a: "La NINTENDO SWITCH",
    b: "La PLAY 5",
    c: "La PLAY 2"
  },
  correctAnswer: "b"
},
  
  
    {
        question: "¿Cuál es la red social más utilizada en todo el mundo?",
        answers: {
            a: "Facebook",
            b: "Twitter",
            c: "Instagram"
        },
        correctAnswer: "a"
    },

  
];

const randomQuestions = myQuestions.sort(() => Math.random() - 0.5).slice(0, 5);

function buildQuiz() {
  const output = [];

  randomQuestions.forEach((currentQuestion, questionNumber) => {
    const answers = [];

    for (letter in currentQuestion.answers) {
      answers.push(
        `<label>
          <input type="radio" name="question${questionNumber}" value="${letter}">
          ${letter}: ${currentQuestion.answers[letter]}
        </label>`
      );
    }

    output.push(
      `<div class="question"> ${currentQuestion.question} </div>
      <div class="answers"> ${answers.join('')}</div>`
    );
  });

  quizContainer.innerHTML = output.join('');
}

function showResults() {
  const answerContainers = quizContainer.querySelectorAll('.answers');

  let numCorrect = 0;

  randomQuestions.forEach((currentQuestion, questionNumber) => {
    const answerContainer = answerContainers[questionNumber];
    const selector = `input[name=question${questionNumber}]:checked`;
    const userAnswer = (answerContainer.querySelector(selector) || {}).value;

    if (userAnswer) {
      if (userAnswer === currentQuestion.correctAnswer) {
        numCorrect++;

        answerContainers[questionNumber].style.color = 'green';
      } else {
        answerContainers[questionNumber].style.color = 'red';
      }
    } else {
      answerContainers[questionNumber].style.color = 'red';
    }
  });

  resultsContainer.innerHTML = `${numCorrect} de ${randomQuestions.length} preguntas correctas`;

  submitButton.style.display = 'none';
}

buildQuiz();

function restartQuiz(){
    location.reload();
}

submitButton.addEventListener('click', showResults);
restartButton.addEventListener('click', restartQuiz);

