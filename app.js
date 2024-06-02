const formConfig = [
    {
        question: "Select a period of time",
        options: ["Evening", "May", "Night", "1999", "Morning", "Monday"]
    },
    {
        question: "Select a location",
        options: ["School", "Street", "Hospital", "Car", "Supermarket", "Downtown"]
    },
    {
        question: "Select a character",
        options: ["Women", "Doctor", "Student", "Maid", "Actress", "Writer"]
    },
    {
        question: "Select the reason of death",
        options: ["Gun", "Wound", "Weapon","Scissors","Shoes", "Fruit"]
    }
];

const answers = {};
function generateForm() {
    const formContainer = document.getElementById('form');
    formConfig.forEach((section, index) => {
        const sectionDiv = document.createElement('div');
        sectionDiv.id = `section${index + 1}`;
        sectionDiv.className = 'form-container';
        if (index !== 0) {
            sectionDiv.style.display = 'none';
        }
        
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question fs-3';
        questionDiv.textContent = section.question;
        sectionDiv.appendChild(questionDiv);
        
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'button-group';
        section.options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.onclick = () => selectAnswer(index + 1, option);
            buttonGroup.appendChild(button);
        });
        if (index === 0) {
        const regenerateButton = document.createElement('button');
        regenerateButton.className = 'btn btn-secondary';
        regenerateButton.textContent = 'Regenerate Options';
        regenerateButton.onclick = regenerateTimeOptions;
        sectionDiv.appendChild(regenerateButton);
        }

        sectionDiv.appendChild(buttonGroup);
        formContainer.appendChild(sectionDiv);
    });
    
    const submitButton = document.createElement('button');
    submitButton.className = 'submit-button';
    submitButton.textContent = 'Submit';
    submitButton.style.display = 'none';
    submitButton.onclick = submitForm;
    formContainer.appendChild(submitButton);
}


function selectAnswer(section, answer) {
    answers['section' + section] = answer;
    const currentSection = document.getElementById('section' + section);
    currentSection.classList.add('active');
    updateButtonSelection(section, answer);
    
    const nextSection = document.getElementById('section' + (section + 1));
    if (nextSection) {
        nextSection.style.display = 'flex';
    } else {
        document.querySelector('.submit-button').style.display = 'block';
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

function regenerateTimeOptions() {
    fetch('http://127.0.0.1:5000/get_time_options')
        .then(response => response.json())
        .then(data => {
            timeOptions = data.time_options;
            console.log(timeOptions)
            // Check if timeOptions is a string and try to parse it
            if (typeof timeOptions === 'string') {
                try {
                    timeOptions = JSON.parse(timeOptions);
                } catch (e) {
                    console.error('Error parsing timeOptions:', e);
                    return;
                }
            }

            if (Array.isArray(timeOptions)) {
                const buttonGroup = document.querySelector('#section1 .button-group');
                buttonGroup.innerHTML = ''; // Clear existing options

                timeOptions.forEach(option => {
                    const button = document.createElement('button');
                    button.textContent = option;
                    button.onclick = () => selectAnswer(1, option);
                    buttonGroup.appendChild(button);
                });
            } else {
                console.error('Error: timeOptions is not an array');
            }
        })
        .catch(error => console.error('Error:', error));
}

async function submitForm() {
    console.log(JSON.stringify(answers));
    
    const responseDiv = document.getElementById('response');
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
        responseDiv.innerHTML = data.answer;
    } catch (error) {
        responseDiv.innerHTML = 'Error: ' + error.message;
    }
}

async function generateTimes() {
    console.log(JSON.stringify(answers));
    
    try {
        const response = await fetch('http://127.0.0.1:5000/get_time_options', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(answers)
        });
        const data = await response.json();
        responseDiv.innerHTML = data.answer;
    } catch (error) {
        responseDiv.innerHTML = 'Error: ' + error.message;
    }
}

async function submitForm() {
    console.log(JSON.stringify(answers));
    
    const responseDiv = document.getElementById('response');
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
        responseDiv.innerHTML = data.answer;
    } catch (error) {
        responseDiv.innerHTML = 'Error: ' + error.message;
    }
}

async function submitForm() {
    console.log(JSON.stringify(answers));
    
    const responseDiv = document.getElementById('response');
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
        responseDiv.innerHTML = data.answer;
    } catch (error) {
        responseDiv.innerHTML = 'Error: ' + error.message;
    }
}

document.addEventListener('DOMContentLoaded', generateForm);