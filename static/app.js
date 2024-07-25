var BACKEND_URL = "https://situationpuzzlegenerator.azurewebsites.net";
// const backendUrl = BACKEND_URL || 'http://127.0.0.1:5000';
const backendUrl = 'http://127.0.0.1:5010';


const initialMaxNumCluesToConceal = 2;
var maxNumCluesToConceal = initialMaxNumCluesToConceal;
var numCluesToSelect = maxNumCluesToConceal;

const formConfig = [
    {
        question: "Select a period of time",
        options: ["Evening", "May", "Night", "1999", "Morning", "Monday"]
    },
    {
        question: "Select a location",
        options: ["Paris", "Street", "Hospital", "Car", "Grocery", "Downtown"]
    },
    {
        question: "Select a character",
        options: ["Hero", "Villain", "Sidekick", "Mentor", "Monster", "Princess"]
    },
    {
        question: "Select the object",
        options: ["Gun", "Wound", "Weapon","Scissors","Shoes", "Fruit"]
    }
];

const answers = {};
// puzzles={};
draft_story="";
// final_story=[]; // A pair <puzzle, answer>
final_puzzle="";
final_answer="";
next_question="";

const winningAnswer = "right"; // How do we consider the game is won -> when host AI replies "right"

const maxNumQuestions = 5;
var numQuestionsLeft = maxNumQuestions;

var cluesToHide = {};
function generateForm() {
    const formContainer = document.getElementById('form');
    formConfig.forEach((section, index) => {
        sectionDiv = document.createElement('div');
        sectionDiv.id = `section${index + 1}`;
        sectionDiv.className = 'form-container';

        if (index !== 0) {
            sectionDiv.style.display = 'none';
        }

        const rowDiv = document.createElement('div');
        rowDiv.className = 'row align-items-center';

        const buttonGroupCol = document.createElement('div');
        buttonGroupCol.className = 'col-8';

        questionDiv = document.createElement('div');
        questionDiv.className = 'question fs-4';
        questionDiv.textContent = section.question;
        sectionDiv.appendChild(questionDiv);

        buttonGroup = document.createElement('div');
        buttonGroup.className = 'button-group';
        section.options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.className = 'button';
            button.onclick = () => selectAnswer(index + 1, option);
            buttonGroup.appendChild(button);
        });

        buttonGroupCol.appendChild(buttonGroup);

        const regenerateButtonCol = document.createElement('div');
        regenerateButtonCol.className = 'col-4 text-end';

        const regenerateButton = document.createElement('button');
        regenerateButton.textContent = 'Regenerate';
        regenerateButton.className = 'btn btn-outline-primary me-md-2';
        regenerateButton.onclick = () => regenerateOptions(index + 1);
        regenerateButtonCol.appendChild(regenerateButton);

        rowDiv.appendChild(buttonGroupCol);
        rowDiv.appendChild(regenerateButtonCol);

        sectionDiv.appendChild(rowDiv);

        formContainer.appendChild(sectionDiv);
    });
    // Generate story draft button
    const generateButtonDiv = document.getElementById("generate-button")
    const submitButton = document.createElement('button');
    submitButton.className = 'submit-button';
    submitButton.id="submit-button";
    submitButton.textContent = 'Give me a draft idea';
    submitButton.style.display = 'none';
    submitButton.onclick = submitForm;
    generateButtonDiv.appendChild(submitButton);

    // Final generate button
    const finalGenerateButtonDiv = document.getElementById("final-generate-button")
    const finalSubmitButton = document.createElement('button');
    finalSubmitButton.className = 'submit-button';
    finalSubmitButton.id="final-submit-button";
    finalSubmitButton.textContent = 'Generate a Puzzle from this!';
    finalSubmitButton.style.display = 'none';
    finalSubmitButton.onclick = submitDraft;
    finalGenerateButtonDiv.appendChild(finalSubmitButton);

    // Final generate button
    const playButtonDiv = document.getElementById("play-button-div")
    const playButton = document.createElement('button');
    playButton.className = 'submit-button';
    playButton.id="play-button";
    playButton.textContent = 'Start Playing';
    playButton.style.display = 'none';
    playButton.onclick = startPlay;
    playButtonDiv.appendChild(playButton);


    // Restart button
    const restartButton = document.getElementById("restart-button")
    restartButton.onclick = () => {location.reload();};



    // TODO: remove
    // generateFinalStory()
}


function selectAnswer(section, answer) {
    answers['section' + section] = answer;
    const currentSection = document.getElementById('section' + section);
    currentSection.classList.add('active');
    updateButtonSelection(section, answer);

    const nextSection = document.getElementById('section' + (section + 1));
    if (nextSection) {
        nextSection.style.removeProperty('display');
    } else {
        document.getElementById("submit-button").style.display = 'block';
    }
}

function revealFinalGenerateButton() {
    document.getElementById("final-submit-button").style.display = 'block';
}

function revealPlayButton() {
    document.getElementById("play-button").style.display = 'block';
}

function validateInput(section, input) {
    if (input.trim() !== '') {
        selectAnswer(section, input);
        return true;
    }
    return false;
}

function updateButtonSelection(section, answer) {
    const buttons = document.querySelectorAll(`#section${section} .button-group button`);
    buttons.forEach(button => {
        if (button.textContent === answer) {
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }
    });
}

function regenerateOptions(section) {
    const typeMapping = {
        1: 'time',
        2: 'place',
        3: 'character',
        4: 'object'
    };
    const type = typeMapping[section];
    console.log("regenerateOPtions");

    fetch(`${backendUrl}/get_options?type=${type}`)
        .then(response => response.json())
        .then(data => {
            let options = data[`options`];
            console.log(options);
            // Check if options is a string and try to parse it
            if (typeof options === 'string') {
                try {
                    options = JSON.parse(options);
                } catch (e) {
                    console.error('Error parsing options:', e);
                    buttonGroup.innerHTML = ''; // Clear existing options
                    buttonGroup.textContent = "Something went wrong. Please try again";
                    return;
                }
            }

            if (Array.isArray(options)) {
                const buttonGroup = document.querySelector(`#section${section} .button-group`);
                buttonGroup.innerHTML = ''; // Clear existing options

                options.forEach(option => {
                    const button = document.createElement('button');
                    button.textContent = option;
                    button.onclick = () => selectAnswer(section, option);
                    buttonGroup.appendChild(button);
                });
            } else {
                console.error('Error: options is not an array');
                buttonGroup.innerHTML = ''; // Clear existing options
                buttonGroup.textContent = "Something went wrong. Please try again";
            }
        })
        .catch(error => {
            console.error('Error:', error)
                buttonGroup.innerHTML = ''; // Clear existing options
                buttonGroup.textContent = "Something went wrong. Please try again";
        });
}

async function splitDraftStory(draftStory)
{
    const response = await fetch(`${backendUrl}/split_story`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"story": draftStory})
    });
    const data = await response.json();
    return data["split_story_segments"];
}

async function submitForm() {
    console.log(JSON.stringify(answers));
    const responseDiv = document.getElementById('response');
    responseDiv.style.removeProperty('display');
    responseDiv.innerHTML = 'Loading...';
    revealFinalGenerateButton();
    try {
        const response = await fetch(`${backendUrl}/generate_draft_story`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(answers)
        });
        const data = await response.json();
        // data = "In 1999, in a remote car park, a popular reality TV show contestant known as \"Sidekick\" was found dead. The cause of death was determined to be a mysterious wound that appeared to have been inflicted with a sharp object. Despite there being no witnesses to the crime, the police began to investigate the other contestants on the show, as tensions had been running high among the competitors. As they delved deeper into the lives of the contestants, they uncovered a web of jealousy, rivalry, and betrayal that ultimately led to the shocking murder of \"Sidekick.\" Through careful examination of the evidence left behind at the scene, the police were able to piece together the sequence of events that had led to the tragic death of the reality TV star."
        console.log(data)
        // Split the text into sentences
        // let sentences = data.answer.split(/[.!?]+/).filter(i => i); // Remove empty
        let sentences = await splitDraftStory(data.answer)
        // Check if options is a string and try to parse it
        if (typeof sentences === 'string') {
            try {
                sentences = JSON.parse(sentences);
            } catch (e) {
                console.error('Error parsing story and answer:', e);
                responseDiv.innerHTML = ''; // Clear existing options
                responseDiv.textContent = "Something went wrong. Please try again";
                return;
            }
        }
        // let sentences = data.split(/[.!?]+/);
        maxNumCluesToConceal = Math.min(initialMaxNumCluesToConceal, sentences.length)
        sentences.forEach((sentence) => {
        console.log("Sentence " + sentence)
        }
        )
        console.log("Sentence length" + sentences.length)
        numCluesToSelect = maxNumCluesToConceal;
        responseDiv.innerHTML = "";
        storyTitleDiv = document.createElement('div');
        storyTitleDiv.className = 'question fs-4';
        storyTitleDiv.textContent = "Situation Story Draft. Max number of clues to hide: " + maxNumCluesToConceal;
        responseDiv.appendChild(storyTitleDiv);

        storyDraft = document.createElement('p');
        storyDraft.className = "button-group"
        sentences.forEach((sentence) => {
            if(sentence.trim() !== '') {
                sentence = sentence.trim()
                let buttonSpan = document.createElement('span');
                buttonSpan.textContent = sentence;
                buttonSpan.className = "draft";
                buttonSpan.addEventListener('click', () => {
                    console.log(buttonSpan.style.backgroundColor)
                    if (buttonSpan.getAttribute("data-state") == "selected") {
                            buttonSpan.className = "draft";
                            numCluesToSelect += 1;
                            buttonSpan.setAttribute("data-state", "unselected");
                            delete cluesToHide[buttonSpan.textContent];
                    }
                    else {
                        if (numCluesToSelect > 0) {
                            buttonSpan.className = "draft_selected";
                            numCluesToSelect -= 1;
                            buttonSpan.setAttribute("data-state", "selected");
                            cluesToHide[buttonSpan.textContent] = true;
                        }
                        else {
                            console.log("numCluesExceeded");
                        }
                    }
                    console.log("numClues: " + numCluesToSelect);
                });
                storyDraft.appendChild(buttonSpan);
            }
        });

        responseDiv.appendChild(storyDraft);

        draft_story = data.answer;
    } catch (error) {
        responseDiv.innerHTML = 'Error: ' + error.message;
    }
}

/**
 * Submit draft (for final story)
 */
async function submitDraft() {
    console.log("submitDraft")
    if (numCluesToSelect < maxNumCluesToConceal) {
        // TODO: submit
        console.log(cluesToHide)
        finalstorydiv=document.getElementById("final-story");
        finalstorydiv.textContent = JSON.stringify(cluesToHide);
        finalstorydiv.style.display = "block";
        generateFinalStory();
        revealPlayButton();
    };
}

// async function generatePuzzleQuestion(sentences) {
//     const puzzleDiv = document.getElementById('puzzle-form');
//     puzzleDiv.style.removeProperty('display');
//     puzzleDiv.innerHTML = '';

//     sentences.forEach((sentence) => {
//         if(sentence.trim() !== '') {
//             let button = document.createElement('button');
//             button.className = "btn btn-outline-primary mb-2 mt-2";
//             button.textContent = sentence.trim(); // Set the sentence as the button text
//             button.onclick = () => selectPuzzleAnswer(sentence);
//             puzzleDiv.appendChild(button);
//         }
//     });
// }

// function selectPuzzleAnswer(answer) {
//     if (!puzzles[answer]) {
//         puzzles[answer] = true;
//     } else {
//         delete puzzles[answer];
//     }
//     updatePuzzleButtonSelection();
//     const puzzleCount = Object.keys(puzzles).length;
//     const confirmButton = document.getElementById('confirm-button');
//     if (puzzleCount > 0 && puzzleCount < 5) {
//         confirmButton.style.removeProperty('display');
//     } else {
//         confirmButton.style.display = 'none';
//     }
// }

// function updatePuzzleButtonSelection() {
//     const puzzlebuttons = document.querySelectorAll('#puzzle-form button');
//     puzzlebuttons.forEach(button => {
//         if (puzzles[button.textContent]) {
//             button.classList.remove('btn-outline-primary');
//             button.classList.add('btn-primary');
//         } else {
//             button.classList.remove('btn-primary');
//             button.classList.add('btn-outline-primary');
//         }
//     });
// }

function generateFinalStoryElement(finalstorydiv, round, callText, responseText)
{
    var storyElem = document.createElement('div')
    storyElem.className = "round-container";
    storyElem.style = "margin-left: 10px"

    var storyTitleTextDiv = document.createElement('div')
    storyTitleText = document.createElement('h1');
    storyTitleText.className = "text-uppercase fs-4 mb-3 mt-2";
    storyTitleText.textContent = callText + ":\n";
    storyTitleTextDiv.appendChild(storyTitleText);
    storyElem.appendChild(storyTitleTextDiv);

    var storyTextDiv = document.createElement('div')
    storyText = document.createElement('text-start');
    storyText.className = "final-story-cls";
    storyText.textContent = round[0];
    storyTextDiv.appendChild(storyText);
    storyElem.appendChild(storyTextDiv);

    var answerTitleTextDiv = document.createElement('div')
    answerTitleText = document.createElement('h1');
    answerTitleText.className = "text-uppercase fs-4 mb-3 mt-5";
    answerTitleText.textContent = responseText + ":\n";
    answerTitleTextDiv.appendChild(answerTitleText);
    storyElem.appendChild(answerTitleTextDiv);

    var answerTextDiv = document.createElement('div')
    answerText = document.createElement('text-start');
    answerText.className = "final-story-cls";
    answerText.textContent = round[1];
    answerTextDiv.appendChild(answerText);
    storyElem.appendChild(answerTextDiv);

    finalstorydiv.appendChild(storyElem);

}

function generateQAElement(playTraceDiv, data, label)
{
    var storyElem = document.createElement('div')
    storyElem.className = "round-container";
    storyElem.style = "margin-left: 10px"

    var storyTitleTextDiv = document.createElement('div')
    storyTitleText = document.createElement('h1');
    storyTitleText.className = "text-uppercase fs-4 mb-3 mt-2";
    storyTitleText.textContent = label + ":\n";
    storyTitleTextDiv.appendChild(storyTitleText);
    storyElem.appendChild(storyTitleTextDiv);

    var storyTextDiv = document.createElement('div')
    storyText = document.createElement('text-start');
    storyText.className = "final-story-cls";
    storyText.textContent = data;
    storyTextDiv.appendChild(storyText);
    storyElem.appendChild(storyTextDiv);

    playTraceDiv.appendChild(storyElem);
}

async function generateFinalStory() {
    // Placeholder function for final story generation
    console.log('Generating final story with selected clues to hide: ' + Object.keys(cluesToHide).join(', '));
    finalstorydiv=document.getElementById("final-story");
    finalstorydiv.style.removeProperty('display');
    finalstorydiv.innerHTML = 'Loading...';
    try {
        const response = await fetch(`${backendUrl}/generate_final_story`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cluesToHide)
        });
        data = await response.json();
        final_story = data[`story`];
        console.log(final_story);
        // Check if options is a string and try to parse it
        if (typeof final_story === 'string') {
            try {
                final_story = JSON.parse(final_story);
            } catch (e) {
                console.error(`Error parsing story ${final_story} and answer:`, e);
                finalstorydiv.innerHTML = ''; // Clear existing options
                finalstorydiv.textContent = "Something went wrong. Please try again";
                return;
            }
        }
        console.log(final_story);

        if (Array.isArray(final_story)) {
            console.assert(final_story.length == 2);
            final_puzzle = final_story[0];
            final_answer = final_story[1];
            generateFinalStoryElement(finalstorydiv, [final_puzzle, final_answer], "Puzzle", "Answer")

        } else {
            console.error('Error: options is not an array');
            finalstorydiv.innerHTML = ''; // Clear existing options
            finalstorydiv.textContent = "Something went wrong. Please try again";
        }
    } catch (error) {
        finalstorydiv.innerHTML = 'Error: ' + error.message;
    }
}

async function startPlay() {
    var playTraceDiv=document.getElementById("play-trace-div");
    playTraceDiv.textContent = "";
    numQuestionsLeft = maxNumQuestions;

    getAIPlayerQuestion();
}

async function getAIPlayerQuestion() {
    var playTraceDiv=document.getElementById("play-trace-div");
    if (numQuestionsLeft == 0)
    {
        gameOver(maxNumQuestions, false);
        return;
    }
    try {
        const response = await fetch(`${backendUrl}/ai_game_play`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(final_puzzle)
        });
        data = await response.json();
        next_question = data[`question`];
        console.log(next_question);
        // Check if options is a string and try to parse it
        if (typeof next_question === 'string') {
            try {
                next_question = JSON.parse(next_question);
            } catch (e) {
                console.error('Error parsing story and answer:', e);
                playTraceDiv.innerHTML = ''; // Clear existing options
                playTraceDiv.textContent = "Something went wrong. Please try again";
                return;
            }
        }
        console.log(next_question);

        if (Array.isArray(next_question)) {
            next_question = next_question[0]
            generateQAElement(playTraceDiv, next_question, "Question");
            getAIHostAnswer();
        } else {
            console.error('Error: options is not an array');
        }
    } catch (error) {
        playTraceDiv.innerHTML = 'Error: ' + error.message;
    }
}

async function getAIHostAnswer() {
    console.assert(typeof next_question === "string")
    var playTraceDiv=document.getElementById("play-trace-div");
    if (numQuestionsLeft == 0)
    {
        gameOver(maxNumQuestions, false);
        return;
    }
    try {
        const response = await fetch(`${backendUrl}/ai_game_host`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({"puzzle": final_puzzle, "true_answer": final_answer,  "question": next_question})
        });
        data = await response.json();
        var answer = data["answer"];
        console.log(answer);
        // Check if options is a string and try to parse it
        if (typeof answer === 'string') {
            try {
                answer = JSON.parse(answer);
            } catch (e) {
                console.error(`Error parsing story and answer ${answer}:`, e);
                playTraceDiv.innerHTML = ''; // Clear existing options
                playTraceDiv.textContent = "Something went wrong. Please try again";
                return;
            }
        }

        if (Array.isArray(answer)) {
            answer = answer[0].toLowerCase();
            console.log(answer);
            if (answer == winningAnswer)
            {
                generateQAElement(playTraceDiv, answer + "! You solved it!", "Answer");
                numQuestionsLeft -= 1;
                gameOver(maxNumQuestions - numQuestionsLeft, true)
            }
            else
            {
                generateQAElement(playTraceDiv, answer, "Answer");
                numQuestionsLeft -= 1;
                getAIPlayerQuestion();
            }
        } else {
            console.error('Error: options is not an array');
            playTraceDiv.innerHTML = ''; // Clear existing options
            playTraceDiv.textContent = "Something went wrong. Please try again";
        }
    } catch (error) {
        playTraceDiv.innerHTML = 'Error: ' + error.message;
    }
}

function displayPlayResult(numberRounds, solved)
{
    const playResultDiv = document.getElementById("play-result-div");
    playResultDiv.style.display = "block";
    const playResult = document.getElementById("play-result");
    playResult.style.display = "block";
    if (solved)
    {
        playResult.style += " background-color:green"
        document.getElementById("play-result-solved").style.display = "block";
        document.getElementById("play-result-unsolved").style.display = "none";
    }
    else
    {
        document.getElementById("play-result-solved").style.display = "none";
        document.getElementById("play-result-unsolved").style.display = "block";
    }
    document.getElementById("play-result-num-rounds").textContent = numberRounds;
    document.getElementById("play-result-score").textContent = numberRounds;
}

function gameOver(numGuesses, solved)
{
    displayPlayResult(numGuesses, solved);
}



document.addEventListener('DOMContentLoaded', generateForm);