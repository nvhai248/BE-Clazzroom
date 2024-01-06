const { subscribeToMessages } = require("./subscriber");

function startSubscribers() {
  // Start the subscribers for different topics
  subscribeToMessages("test", (message) => {
    console.log(message);
  });
  subscribeToMessages("TeacherFinalizedGrade", handleMessage1);
  subscribeToMessages("TeacherMakeFinalDecision", handleMessage2);
  subscribeToMessages("UserAddComment", handleMessage3);
  subscribeToMessages("StudentCreateReview", handleMessage4);
}

function handleMessage1(message) {
  console.log("Handling message for 'TeacherFinalizedGrade':", message);
  // Process message for 'TeacherFinalizedGrade'
}

function handleMessage2(message) {
  console.log("Handling message for 'TeacherMakeFinalDecision':", message);
  // Process message for 'TeacherMakeFinalDecision'
}

function handleMessage3(message) {
  console.log("Handling message for 'UserAddComment':", message);
  // Process message for 'UserAddComment'
}

function handleMessage4(message) {
  console.log("Handling message for 'StudentCreateReview':", message);
  // Process message for 'StudentCreateReview'
}

module.exports = { startSubscribers };
