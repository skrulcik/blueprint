// Animation helpers for PaperJS
//
// Paper animations require persisting state across frame handlers, and
// tracking which objects to update. This miniature animation framework
// attempts to avoid that messiness. It allows client code to define an update
// function that will be called repeatedly, potentially with new information.
// The Animation object encapsulates any necessary state. The provided factory
// methods illustrate how simple state information can be stored with the
// Animation object for use by the step function. The combination of a single
// step function and state encapsulation avoid the mess of global state and
// cluttered frame handlers that would otherwise occur with Paper animations.
//
// Call `initializeAnimations
//
// Possible design changes:
//
// Currently, update is triggered every step. Skipping steps is easy with %,
// but creates some boilerplate. It wouldn't be smooth not to animate every
// step, and long pauses should be in separate animations anyways, so I'm
// leaving skipping up to the client code for now.
//
// Time, rather than step count, might also be desirable. This complicates
// animation structure quite a bit, and it can be approximated with some frame
// rate calculations, so I'll leave that out.


// Global array of animations the frame event handler needs to update
const _activeAnimations = [];
const _doNothing = () => {};

class Animation {
    // Creates a Paper animation that will automatically step on each frame
    // update until its `stop` method is invoked.
    //
    // stepFunction - a no-args function to update the position of the
    // animated object
    // onComplete - (optional) a no-args function that runs once the animation
    // has completed
    constructor(stepFunction, onComplete) {
        this.step = stepFunction;
        _activeAnimations.push(this);
        this.onComplete = onComplete || _doNothing;
    }

    stop() {
        const idx = _activeAnimations.indexOf(this);
        _activeAnimations.splice(idx, 1);
        this.onComplete();
    }
}

// Creates an animation object that updates a fixed number of times before completing
//
// totalSteps - # of times to update the animation before stopping
// stepFunction - given the current step number (from 0 to totalSteps - 1),
//     updates the animated object
// onComplete - (optional) a no-args function that runs once the animation has
// completed
function createFixedStepAnimation(totalSteps, stepFunction, onComplete) {
    const stepWrapper = function() {
        stepFunction(this._steps);
        this._steps += 1;
        if (this._steps === totalSteps) {
            this.stop();
        }
    };
    const stepAnimation = new Animation(stepWrapper, onComplete);
    stepAnimation._steps = 0;
    return stepAnimation;
}

// Creates an animation that passes points along a line to its step function.
//
// totalSteps - # of times to update the animation before stopping
// start - the `Point` defining where the line begins
// end - the `Point` defining where the line ends
// stepFunction(x,y) - given the current x, y along the line from start to end,
//     updates the animated object
// onComplete - (optional) a no-args function that runs once the animation has
// completed
function createLinearMoveAnimation(totalSteps, start, end, stepFunction, onComplete) {
    const xStep = (end.x - start.x) / totalSteps;
    const yStep = (end.y - start.y) / totalSteps;
    const stepWrapper = function(count) {
        // Avoid round-off errors for the last position
        if (count == totalSteps - 1) {
            stepFunction(end.x, end.y);
        } else {
            stepFunction(start.x + xStep * count, start.y + yStep * count);
        }
    }
    return createFixedStepAnimation(totalSteps, stepWrapper, onComplete);
}

// TODO support multiple views and/or scope animation creation to views
function initializeAnimationFramework(view) {
    view.on('frame', function() {
        for (const animation of _activeAnimations) {
            animation.step(animation);
        }
    });
}

