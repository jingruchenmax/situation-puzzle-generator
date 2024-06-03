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
        question: "Select the reason of death",
        options: ["Gun", "Wound", "Weapon","Scissors","Shoes", "Fruit"]
    }
];

const answers = {};
puzzles={};
draft_story="";
final_story="";
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
    const generateButtonDiv = document.getElementById("generate-button")
    const submitButton = document.createElement('button');
    submitButton.className = 'submit-button';
    submitButton.id="submit-button";
    submitButton.textContent = 'Generate';
    submitButton.style.display = 'none';
    submitButton.onclick = submitForm;
    generateButtonDiv.appendChild(submitButton);
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
        4: 'weapon'
    };
    const type = typeMapping[section];

    fetch(`http://127.0.0.1:5000/get_options?type=${type}`)
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
            }
        })
        .catch(error => console.error('Error:', error));
}

async function submitForm() {
    console.log(JSON.stringify(answers));
    
    const responseDiv = document.getElementById('response');
    responseDiv.style.removeProperty('display');
    responseDiv.innerHTML = 'Loading...';

    try {
        const response = await fetch('http://127.0.0.1:5000/generate_draft_story', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(answers)
        });
        const data = await response.json();
        responseDiv.innerHTML = "";
        storyTitleDiv = document.createElement('div');
        storyTitleDiv.className = 'question fs-4';
        storyTitleDiv.textContent = "Situation Story Draft";
        responseDiv.appendChild(storyTitleDiv);

        storyDiv = document.createElement('div');
        storyDiv.className = 'text-start';
        storyDiv.textContent = data.answer;
        responseDiv.appendChild(storyDiv);

        draft_story=data.answer;
        generatePuzzleQuestion();
    } catch (error) {
        responseDiv.innerHTML = 'Error: ' + error.message;
    }
}

async function generatePuzzleQuestion(){
    const puzzleDiv = document.getElementById('puzzle-form');
    puzzleDiv.style.removeProperty('display');
    puzzleDiv.innerHTML = 'Loading...';
    puzzles={}
    fetch(`http://127.0.0.1:5000/get_puzzle_options`)
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
                    return;
                }
            }

            if (Array.isArray(options)) {
                puzzleDiv.innerHTML = "";
                hintDiv = document.createElement('div');
                hintDiv.className = 'question fs-4';
                hintDiv.textContent = "Choose the information below that you wish to conceal in the situation puzzle";
                puzzleDiv.appendChild(hintDiv);
                options.forEach(option => {
                    buttonDiv = document.createElement('div')
                    button = document.createElement('button');
                    button.className = "btn btn-outline-primary mb-2 mt-2";
                    button.textContent = option;
                    button.onclick = () => selectPuzzleAnswer(option);
                    buttonDiv.appendChild(button);
                    puzzleDiv.appendChild(buttonDiv);
                });
                
                const regeneratePuzzleButton = document.createElement('button');
                regeneratePuzzleButton.className = "btn btn-outline-secondary text-end mt-3";
                regeneratePuzzleButton.id="regen-puzzle-button";
                regeneratePuzzleButton.textContent = "Regenerate";
                regeneratePuzzleButton.onclick = ()=> generatePuzzleQuestion();
                puzzleDiv.appendChild(regeneratePuzzleButton);

                const confirmButtonDiv = document.getElementById("final-generate-button");
                const confirmButton = document.createElement('button');
                confirmButton.id="confirm-button";
                confirmButton.textContent = "Confirm";
                confirmButton.className = "btn btn-success text-start";
                confirmButton.onclick = () => generateFinalStory();
                confirmButton.style.display = 'none';
                confirmButtonDiv.appendChild(confirmButton);
            } else {
                console.error('Error: options is not an array');
            }
        })
        .catch(error => console.error('Error:', error));
}

function selectPuzzleAnswer(answer) {
    if (!puzzles[answer]) {
        puzzles[answer] = true;
    } else {
        delete puzzles[answer];
    }
    updatePuzzleButtonSelection();
    const puzzleCount = Object.keys(puzzles).length;
    const confirmButton = document.getElementById('confirm-button');
    if (puzzleCount > 0 && puzzleCount < 5) {
        confirmButton.style.removeProperty('display');
    } else {
        confirmButton.style.display = 'none';
    }
}

function updatePuzzleButtonSelection() {
    const puzzlebuttons = document.querySelectorAll('#puzzle-form button');
    puzzlebuttons.forEach(button => {
        if (puzzles[button.textContent]) {
            button.classList.remove('btn-outline-primary');
            button.classList.add('btn-primary');
        } else {
            button.classList.remove('btn-primary');
            button.classList.add('btn-outline-primary');
        }
    });
}

async function generateFinalStory() {
    // Placeholder function for final story generation
    console.log('Generating final story with selected puzzles: ' + Object.keys(puzzles).join(', '));
    finalstorydiv=document.getElementById("final-story");
    finalstorydiv.style.removeProperty('display');
    finalstorydiv.innerHTML = "";
    try {
        const response = await fetch('http://127.0.0.1:5000/generate_final_story', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(puzzles)
        });
        data = await response.json();
        final_story = data[`story`];
        console.log(final_story);
        // Check if options is a string and try to parse it
        if (typeof final_story === 'string') {
            try {
                final_story = JSON.parse(final_story);
            } catch (e) {
                console.error('Error parsing story and answer:', e);
                return;
            }
        }

        if (Array.isArray(final_story)) {


            storyTitleTextDiv = document.createElement('div')
            storyTitleText = document.createElement('h1');
            storyTitleText.className = "text-uppercase fs-4 mb-3 mt-2";
            storyTitleText.textContent = "Situation\n";
            storyTitleTextDiv.appendChild(storyTitleText);
            finalstorydiv.appendChild(storyTitleTextDiv);

            storyTextDiv = document.createElement('div')
            storyText = document.createElement('text-start');
            storyText.className = "mb-5";
            storyText.textContent = final_story[0];
            storyTextDiv.appendChild(storyText);
            finalstorydiv.appendChild(storyTextDiv);

            answerTitleTextDiv = document.createElement('div')
            answerTitleText = document.createElement('h1');
            answerTitleText.className = "text-uppercase fs-4 mb-3 mt-5";
            answerTitleText.textContent = "Answer\n";
            answerTitleTextDiv.appendChild(answerTitleText);
            finalstorydiv.appendChild(answerTitleTextDiv);

            answerTextDiv = document.createElement('div')
            answerText = document.createElement('text-start');
            answerText.className = "mb-3";
            answerText.textContent = final_story[1];
            answerTextDiv.appendChild(answerText);
            finalstorydiv.appendChild(answerTextDiv);

        } else {
            console.error('Error: options is not an array');
        }
    } catch (error) {
        finalstorydiv.innerHTML = 'Error: ' + error.message;
    }
}

document.addEventListener('DOMContentLoaded', generateForm);