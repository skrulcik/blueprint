// Animation helpers for PaperJS
//
// Each "Animation" represents a sequence of visual events.
//
// Possible design changes:
//
// I dislike returning the next value as part of the update function. I thought
// about passing in a "next(newVal)" function, but I think I'll pass on it for
// simplicity right now.
//
// Currently, update is triggered every step. Skipping steps is easy with %,
// but creates some boilerplate. It wouldn't be smooth not to animate every
// step, and long pauses should be in separate animations anyways, so I'm
// leaving skipping up to the client code for now.
//
// Time, rather than step count, might also be desirable. This complicates
// animation structure quite a bit, and it can be approximated with some frame
// rate calculations, so I'll leave that out.
//
// If FixedStepAnimation is the only one ever used, it might make sense to
// always have a fixed limit, rather than the generalized update function
//


// Types
// =====
//
// Animation
// - val0
// - update(val, next(newVal))
//
// FixedStepAnimation : stops after totalSteps are completed
// - totalSteps
// - update(stepNumber)
//
// LinearMoveAnimation : provides points along line for given interval
// - totalSteps
// - start
// - stop


// Global array of animations the frame event handler needs to update
let _activeAnimations = [];

class Animation {
    // Creates a Paper animation that will automatically step on each frame
    // update until its `stop` method is invoked.
    //
    // stepFunction - a no-args function to update the position of the
    // animated object
    constructor(stepFunction) {
        this.step = stepFunction;
        _activeAnimations.push(this);
    }

    stop() {
        _activeAnimations = _activeAnimations.filter(function(a) { return a != this; });
    }
}

view.on('frame', function() {
    for (const animation of _activeAnimations) {
        animation.step(animation);
    }
});

// Creates an animation object that updates a fixed number of times before completing
//
// totalSteps - # of times to update the animation before stopping
// stepFunction - given the current step number (from 0 to totalSteps - 1),
//     updates the animated object
function createFixedStepAnimation(totalSteps, stepFunction) {
    const stepWrapper = function() {
        stepFunction(this._steps);
        this._steps += 1;
        if (this._steps === totalSteps) {
            this.stop();
        }
    };
    const stepAnimation = new Animation(stepWrapper);
    stepAnimation._steps = 0;
    return stepAnimation;
}

// Creates an animation that passes points along a line to its step function.
//
// totalSteps - # of times to update the animation before stopping
// start - the `Point` defining where the line begins
// end - the `Point` defining where the line ends
// stepFunction - given the current point along the line from start to end,
//     updates the animated object
function createLinearMoveAnimation(totalSteps, start, end, step_function) {
    const xStep = (end.x - start.x) / totalSteps;
    const yStep = (end.y - start.y) / totalSteps;
    const stepWrapper = function(count) {
        // Avoid round-off errors for the last position
        if (count == totalSteps - 1) {
            step_function(end);
        } else {
            step_function((start.x + xStep * count, start.y + yStep * count));
        }
    }
    return createFixedStepAnimation(totalSteps, stepFunction);
}

