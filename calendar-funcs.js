function makeElementWider(id) {
    let element = document.getElementById(`blank-event-${id}`);
    if (!element) {
        element = document.getElementById(`event${id}`);
    }
    const currentWidth = parseFloat(getComputedStyle(element).width);
    const additionalWidth = 59.2;
    element.style.width = `${currentWidth + additionalWidth}px`;
    if (!element.classList.contains(`blank-event`)) {
        element.style.borderRadius = '5px';
    }
    element.style.position = 'absolute';
}

function wrapToNextLine(id, currentboxnum, numpixels) {
    const box = document.getElementById(`calendar-box${currentboxnum+1}`);
    const newLine = document.createElement('p');
    const otherLine = document.getElementById(`blank-event-${id}`);
    const originalLine = document.getElementById(`event${id}`);
    var element;

    if (otherLine) {    
        element = otherLine;
        var randomNumber = Math.floor(Math.random() * 9000000) + 1000000;
        otherLine.id = `blank-event-${id}-${randomNumber}`;
    } else {
        element = originalLine;
    }

    var currentRadius = window.getComputedStyle(element).borderRadius;
    var radiusValues = currentRadius.split(' ');

    if (radiusValues.length === 1) {
        radiusValues = [radiusValues[0], radiusValues[0], radiusValues[0], radiusValues[0]];
    } else if (radiusValues.length === 2) {
        radiusValues = [radiusValues[0], radiusValues[1], radiusValues[0], radiusValues[1]];
    }

    element.style.borderRadius = `${radiusValues[0]} 0 0 ${radiusValues[3]}`;

    const currentWidth = parseFloat(getComputedStyle(element).width);
    element.style.width = `${currentWidth + 1}px`;

    newLine.id = `blank-event-${id}`
    newLine.className = "blank-event";
    newLine.style.marginTop = `${numpixels}px`;
    newLine.style.backgroundColor = originalLine.style.backgroundColor;
    box.appendChild(newLine);
}

const colors = ['#E94E77', '#4CAF50', '#2979FF', '#FFC107', '#7E57C2', '#F50057', '#FF6F00', '#FF8A65', '#009688', '#5C6BC0'];

function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

function shortenElement(id) {
    let element = document.getElementById(`blank-event-${id}`);
    if (!element) {
        element = document.getElementById(`event${id}`);
    }
    const currentWidth = parseFloat(getComputedStyle(element).width);
    element.style.width = `${currentWidth - 2}px`;
}