var mainText = document.getElementById("mainText");
var submitBtn = document.getElementById("submitBtn");

function submitClick() {

  var firebaseRef = firebase.database().ref("Video");

  var messageText = mainText.value;

  firebaseRef.push().set({
    categoryId: '03',
    image: 'aaa',
    isGeneral: 'true',
    title: 'aaa',
    videoLink: 'aaaaaaaa'
  });
}