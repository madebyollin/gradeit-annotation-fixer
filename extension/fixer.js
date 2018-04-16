(function(window, document, undefined) {
    function doOverlap(a1, a2) {
        // get the DOM elements for each annotation
        let e1 = document.getElementById(a1.id);
        let e2 = document.getElementById(a2.id);
        // get the bounding boxes for each element
        let b1 = e1.getBoundingClientRect();
        let b2 = e2.getBoundingClientRect();
    
        // check intersection on y coordinate only
        return (b1.top < b2.bottom && b1.bottom > b2.top) || 
               (b2.top < b1.bottom && b2.bottom > b1.top);
    }

    function autoMoveAnnotations() {
        for (let i = 0; i < 10; i++) {
            if (moveAnnotations()) {
                break;
            }
        }
    }

    function moveAnnotations() {
        let textAnnotations = [];
        // go over all of the annotations
        for (let i = 0; i < annotations.annotationList.length; i++) {
            let a = annotations.annotationList[i];
            if (a.text) {
                textAnnotations.push(a);
            }
        }
    
        // sort in visual order
        textAnnotations.sort((a, b) =>  annotations.lineNumberFor(a.start) - annotations.lineNumberFor(b.start));
        let done = true;
        for (let i = 0; i < textAnnotations.length; i++) {
            let a = textAnnotations[i];
            if (i > 0 && doOverlap(a, textAnnotations[i - 1])) {
                // if we overlap with previous, move down
                // switch to selection mode
                $("select").click();
                let click = new MouseEvent('click');
                document.getElementById(a.id).dispatchEvent(click);
                done = false;
            } else if (i < textAnnotations.length - 1 
                && doOverlap(a, textAnnotations[i + 1])) {
                // switch to selection mode
                $("select").click();
                // if we overlap with the next, move up
                let click = new MouseEvent('click', {shiftKey: true});
                document.getElementById(a.id).dispatchEvent(click);
                done = false;
            }
        }
        return done;
    }

	// not sure what the event is here, oh well, just keep trying
	let setup = () => {
        let toolArea = document.querySelector(".hoveringtoolsarea");
        console.log("window.annotations: ", window.annotations, "toolArea:", toolArea);
        console.log(window);
		if (window.annotations && toolArea) {
			let fixAnnotationsButton = document.createElement("a");
            fixAnnotationsButton.textContent = "Fix Annotations";
            fixAnnotationsButton.style.cssText = "text-align: center;font-weight: bold;padding: 4px 8px;margin: 4px;background: rgb(255, 255, 204);border: 2px solid rgb(153, 0, 0);border-radius: 4px;cursor: pointer;user-select: none; display: block;";
            fixAnnotationsButton.onclick = autoMoveAnnotations;
            toolArea.prepend(fixAnnotationsButton);
		} else {
            window.setTimeout(setup, 5000);
            console.log("Not running in correct iframe");
		}
	}
	setup();
})(this, this.document);