const GAME_STATE = {
    FirstCardAwaits: 'FirstCardAwaits',
    SecondCardAwaits: 'SecondCardAwaits',
    CardsMatchFailed: 'CardsMatchFailed',
    CardsMatched: 'CardsMatched',
    GameFinished: 'GameFinished'
}
const Symbols = [
    'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
    'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
    'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
    'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
]
const view = {
    getCardElement(index) {
        return `<div data-index="${index}" class="card back"></div>`
    },
    getCardContent(index) {
        const number = this.transformNumber((index % 13) + 1)
        const symbol = Symbols[Math.floor(index / 13)]
        return `
      <p>${number}</p>
      <img src="${symbol}" />
      <p>${number}</p>`

    },
    transformNumber(number) {
        switch (number) {
            case 1:
                return 'A'
            case 11:
                return 'J'
            case 12:
                return 'Q'
            case 13:
                return 'K'
            default:
                return number
        }
    },
    displayCards(indexes) {
        const rootElement = document.querySelector('#cards')
        rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
    },
    flipCards(...cards) {
        cards.map(card => {
            if (card.classList.contains('back')) {
                card.classList.remove('back')
                card.innerHTML = this.getCardContent(Number(card.dataset.index))
                return
            }
            card.classList.add('back')
            card.innerHTML = null
        })
    },
    pairCards(...cards) {
        cards.map(card => {
            card.classList.add('paired')
        })
    },
    renderScore(score) {
        document.querySelector(".score").innerHTML = `Score: ${score}`;
    },

    renderTriedTimes(times) {
        document.querySelector(".tried").innerHTML = `You've tried: ${times} times`;
    },
    appendWrongAnimation(...cards) {
        cards.map(card => {
            card.classList.add('wrong')
            card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
        })
    },
    showGameFinished() {
        const div = document.createElement('div')
        div.classList.add('completed')
        div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
        const header = document.querySelector('#header')
        header.before(div)
    },


}
const model = {
    revealedCards: [],
    score: 0,
    triedTimes: 0,
    isRevealedCardsMatched() {
        return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
    }
}
const controller = {
    currentState: GAME_STATE.FirstCardAwaits,

    generateCards() {
        view.displayCards(utility.getRandomNumberArray(52))
    },
    dispatchCardAction(card) {
        if (!card.classList.contains('back')) {
            return
        }
        switch (this.currentState) {
            case GAME_STATE.FirstCardAwaits:
                view.flipCards(card)
                model.revealedCards.push(card)
                this.currentState = GAME_STATE.SecondCardAwaits
                break
            case GAME_STATE.SecondCardAwaits:
                view.renderTriedTimes(++model.triedTimes)
                view.flipCards(card)
                model.revealedCards.push(card)
                // 判斷配對是否成功
                if (model.isRevealedCardsMatched()) {
                    // 配對成功
                    view.renderScore(model.score += 10)
                    this.currentState = GAME_STATE.CardsMatched
                    view.pairCards(...model.revealedCards)
                    model.revealedCards = []
                    if (model.score === 260) {
                        console.log('showGameFinished')
                        this.currentState = GAME_STATE.GameFinished
                        view.showGameFinished()  // 加在這裡
                        return
                    }
                    this.currentState = GAME_STATE.FirstCardAwaits
                } else {
                    // 配對失敗
                    this.currentState = GAME_STATE.CardsMatchFailed
                    view.appendWrongAnimation(...model.revealedCards)
                    setTimeout(this.resetCards, 1000)
                }
                break
        }
        console.log('this.currentState', this.currentState)
        console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
    },

    resetCards() {
        view.flipCards(...model.revealedCards)
        model.revealedCards = []
        controller.currentState = GAME_STATE.FirstCardAwaits
    },

    hintCard() {
        // const hint = document.querySelector('.hint')


        if (controller.currentState === GAME_STATE.SecondCardAwaits) {
            const cardElement = [...document.querySelectorAll('.card')]
            let HintCard = cardElement.find(FindHintCard)
            function FindHintCard(card, cardIndex, array) {
                return (cardElement[cardIndex].dataset.index % 13 === model.revealedCards[0].dataset.index % 13 && !cardElement[cardIndex].classList.contains('paired') && cardElement[cardIndex].dataset.index !== model.revealedCards[0].dataset.index)

            }
            HintCard.classList.add('hinted')
            HintCard.addEventListener('animationend', event => event.target.classList.remove('hinted'), { once: true })
            setTimeout(HintCard.resetCards, 1000)
        } else {
            alert('you should choose 1 card fisrt')
        }

    }
}
const utility = {
    getRandomNumberArray(count) {
        const number = Array.from(Array(count).keys())
        for (let index = number.length - 1; index > 0; index--) {
            let randomIndex = Math.floor(Math.random() * (index + 1))
                ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
        }
        return number
    }
}
controller.generateCards()
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', event => {
        controller.dispatchCardAction(card)
    })
})

document.querySelector('.hint').addEventListener('click', controller.hintCard)


////////////////線索
// const hint = document.querySelector('.hint')
// hint.addEventListener('click', function hintCard() {
//         if (controller.currentState === GAME_STATE.SecondCardAwaits) {
//             const cardElement = [...document.querySelectorAll('.card')]
//             // console.log(model.revealedCards[0])
//             // console.log(!cardElement[0].classList.contains('.paired'))

//             // cardElement.forEach(function Case(card, index) {
//             //     // card.dataset.index === 10
//             //     // console.log(card)
//             //     // console.log(card.dataset.index)
//             //     // console.log(model.revealedCards[0].dataset.index)
//             //     if (card.dataset.index % 13 === model.revealedCards[0].dataset.index % 13) {
//             //         console.log(index)
//             //     }
//             // })

//             let HintCard = cardElement.find(FindHintCard)

//             function FindHintCard(card, cardIndex, array) {
//                 return (cardElement[cardIndex].dataset.index % 13 === model.revealedCards[0].dataset.index % 13 && !cardElement[cardIndex].classList.contains('paired') && cardElement[cardIndex].dataset.index !== model.revealedCards[0].dataset.index)

//             }
//             HintCard.classList.add('hinted')
//             HintCard.addEventListener('animationend', event => event.target.classList.remove('hinted'), { once: true })
//             setTimeout(HintCard.resetCards, 1000)
//             // console.log(HintCard)


//         }
//     })



// //////////