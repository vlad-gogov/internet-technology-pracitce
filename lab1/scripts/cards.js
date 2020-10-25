let packCards = {
    array: [
        {id: 1, src: "images/6.png", importance: "6"},
        {id: 2, src: "images/7.png", importance: "7"},
        {id: 3, src: "images/8.png", importance: "8"},
        {id: 4, src: "images/9.png", importance: "9"},
        {id: 5, src: "images/10.png", importance: "10"},
        {id: 6, src: "images/J.png", importance: "Валет"},
        {id: 7, src: "images/Q.png", importance: "Королева"},
        {id: 8, src: "images/K.png", importance: "Король"},
        {id: 9, src: "images/A.png", importance: "Туз"},
    ],
    flip() {
        let flag = this.array.length - 1;
        if (flag === 0) {
            document.getElementById('back-card').hidden = true;
        }
        let number = Math.floor(Math.random() * this.array.length);
        let сard = document.createElement('img');
        сard.className = "card";
        сard.src = this.array[number].src;
        сard.alt = this.array[number].importance;
        if (flag)
            document.getElementById("pack").appendChild(сard);
        else
            document.getElementById("pack").prepend(сard);
        this.array.splice(number, 1);
    }
};