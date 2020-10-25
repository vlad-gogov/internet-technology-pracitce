let arrayСards = [
    {id: 1, src: "image/6.png", importance: "6"},
    {id: 2, src: "image/7.png", importance: "7"},
    {id: 3, src: "image/8.png", importance: "8"},
    {id: 4, src: "image/9.png", importance: "9"},
    {id: 5, src: "image/10.png", importance: "10"},
    {id: 6, src: "image/J.png", importance: "Валет"},
    {id: 7, src: "image/Q.png", importance: "Королева"},
    {id: 8, src: "image/K.png", importance: "Король"},
    {id: 9, src: "image/A.png", importance: "Туз"},
]

function flipCards() {
    let flag = arrayСards.length - 1;
    if (flag == 0) {
        document.getElementById('back-card').hidden = true;
    }
    let number = Math.floor(Math.random() * arrayСards.length);
    let сard = document.createElement('img');
    сard.className = "card";
    сard.src = arrayСards[number].src;
    сard.alt = arrayСards[number].importance;
    if (flag == 0)
        document.body.prepend(сard);
    else
        document.body.appendChild(сard);
        arrayСards.splice(number, 1);

}