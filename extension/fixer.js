(function(window, document, undefined) {
    setup();
    const RACE_CONDITION_DELAY_MS = 50;
    const FONT_SIZE_BUG_MARGIN_PX = 5;

    // Set up annotation-fixer button
    function setup() {
        let toolArea = document.querySelector(".hoveringtoolsarea");
        if (window.annotations && toolArea) {
            // Make a button to call autoMoveAnnotations()
            let fixAnnotationsButton = document.createElement("a");
            fixAnnotationsButton.innerHTML = "Reposition<br />Annotations";
            fixAnnotationsButton.style.cssText = "text-align: center;font-weight: bold;padding: 4px 8px;margin: 4px;background: rgb(255, 255, 204);border: 2px solid rgb(153, 0, 0);border-radius: 4px;cursor: pointer;user-select: none; display: block;";
            fixAnnotationsButton.onclick = autoMoveAnnotations;

            // Add it to the top of the tool area
            toolArea.prepend(fixAnnotationsButton);
        }
    }

    // Main entry point;
    // automatically adjusts annotations (up to an iteration limit)
    // until no annotations overlap
    function autoMoveAnnotations() {
        for (let i = 0; i < 10; i++) {
            if (moveAnnotations().complete) {
                break;
            }
        }
    }


    // Single Iteration:
    // adjust annotations which overlap
    // so that they are more spread out
    // by moving them up/down a line
    // returns {complete: true} if no annotations overlap
    async function moveAnnotations() {

        let textAnnotations = [];

        // Find text (boxed) annotations only
        for (let i = 0; i < annotations.annotationList.length; i++) {
            let a = annotations.annotationList[i];
            if (a.text) {
                textAnnotations.push(a);
            }
        }

        // Sort them in order of vertical position
        textAnnotations.sort((a, b) => annotations.lineNumberFor(a.start) - annotations.lineNumberFor(b.start));

        // Move each one up or down, depending on what it overlaps with
        let complete = true;
        for (let i = 0; i < textAnnotations.length; i++) {
            let a = textAnnotations[i];
            if (i > 0 && checkOverlapOfAnnotations(a, textAnnotations[i - 1])) {
                // if we overlap with previous, move *down*
                $("select").click();
                let click = new MouseEvent('click');
                document.getElementById(a.id).dispatchEvent(click);
                complete = false;
                await sleep(RACE_CONDITION_DELAY_MS);
            } else if (i < textAnnotations.length - 1 &&
                checkOverlapOfAnnotations(a, textAnnotations[i + 1])) {
                // switch to selection mode
                $("select").click();
                // if we overlap with the next, move *up*
                let click = new MouseEvent('click', {
                    shiftKey: true
                });
                document.getElementById(a.id).dispatchEvent(click);
                complete = false;
                await sleep(RACE_CONDITION_DELAY_MS);
            }

        }

        return {
            complete: complete
        };
    }

    // Helper function;
    // Return true iff the annotation objects a1 and a2
    // have vertically-overlapping DOM elements
    function checkOverlapOfAnnotations(a1, a2) {
        let margin = FONT_SIZE_BUG_MARGIN_PX;
        // get the DOM elements for each annotation
        let e1 = document.getElementById(a1.id);
        let e2 = document.getElementById(a2.id);
        // get the visual bounding boxes for each element
        let b1 = e1.getBoundingClientRect();
        let b2 = e2.getBoundingClientRect();
        // check intersection on y coordinate only
        return (b1.top < b2.bottom + margin && b1.bottom + margin > b2.top) ||
            (b2.top < b1.bottom + margin && b2.bottom + margin> b1.top);
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

})(this, this.document);
