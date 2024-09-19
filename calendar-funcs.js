function widenElement(id) {
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
    if (box == null) {
        return;
    }
    const newLine = document.createElement('p');
    const otherLine = document.getElementById(`blank-event-${id}`);
    const originalLine = document.getElementById(`event${id}`);
    var element;

    if (otherLine) {    
        element = otherLine;
        var randomNumber = Math.floor(Math.random() * 9000000) + 1000000;
        otherLine.id = `blank-event-${id}-${randomNumber}`;
        element = document.getElementById(`blank-event-${id}-${randomNumber}`);
        const currentWidth = parseFloat(getComputedStyle(element).width);
        element.style.width = `${currentWidth + 2.875}px`;
    } else {
        element = originalLine; 
        const currentWidth = parseFloat(getComputedStyle(element).width);
        element.style.width = `${currentWidth + 1}px`;
    }

    var currentRadius = window.getComputedStyle(element).borderRadius;
    var radiusValues = currentRadius.split(' ');

    if (radiusValues.length === 1) {
        radiusValues = [radiusValues[0], radiusValues[0], radiusValues[0], radiusValues[0]];
    } else if (radiusValues.length === 2) {
        radiusValues = [radiusValues[0], radiusValues[1], radiusValues[0], radiusValues[1]];
    }

    element.style.borderRadius = `${radiusValues[0]} 0 0 ${radiusValues[3]}`;

    newLine.id = `blank-event-${id}`
    newLine.className = "blank-event";
    newLine.style.marginTop = `${numpixels}px`;
    newLine.style.backgroundColor = originalLine.style.backgroundColor;
    box.appendChild(newLine);
}

const colors = [
    // Warm and muted colors
    '#E94E77', // Muted red
    '#4CAF50', // Muted green
    '#2979FF', // Muted blue
    '#6A5ACD', // Muted purple
    '#f5be1b', // Muted yellow
    '#b03aa0', // More reddish muted pink
  ];

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