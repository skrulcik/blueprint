// Blueprint JS - Scott Krulcik 2018

const PIX_PER_FRAME = 10;
const NUM_PATHS = 3;

// Boilerplate ----------------------------------------------------------------
paper.install(window);
window.onload = function() {
	paper.setup('paper-canvas');
// End Boilerplate ------------------------------------------------------------

    const W = view.size.width;
    const H = view.size.height;
    const background = new Path.Rectangle({
        point: [0, 0],
        size: [W, H],
    });
    background.sendToBack();
    background.fillColor = '#003153';

    const paths = [];
    for (let i = 0; i < NUM_PATHS; i++) {
        paths.push(new Path({
            // 80% black:
            strokeColor: [1],
            strokeWidth: 2,
        }));
    }

    // Retrieves the last user-defined point in an open path. Paper ends such paths
    // with a (NaN, NaN) point, which is not useful.
    function lastRealPoint(path) {
        if (path.isEmpty()) {
            console.warn("Attemtped to obtain the last segment of an empty path");
            return undefined;
        }

        // Technically, such a point could intentionally be added to a path, but
        // this seems to be a cap that is added by Paper.JS. I thought it was on
        // all paths, but it is less consistent than expected.
        let lastPoint = path.lastSegment.point;
        if (isNaN(lastPoint.x) && isNaN(lastPoint.y)) {
            lastPoint = path.firstSegment.point;
        }
        return lastPoint;
    }

    function extendPath(path) {
        if (path.isEmpty()) {
            // If the path has not been started, start it at a random point
            path.add(new Point(W * Math.random(), H * Math.random()));
            return;
        }

        // The new point always starts at the location of the last point, then
        // animates towards a new location
        const lastPoint = lastRealPoint(path);
        path.add(new Point(lastPoint.x, lastPoint.y));
        const newPoint = path.segments[path.segments.length - 1].point;

        // Slowly move the last point in the path to its destination
        const step = function(x, y) {
            newPoint.x = x;
            newPoint.y = y;
        }

        // Add odd-index points horizontal to the last point and even-index points
        // vertical to the last point
        let targetPoint;
        if (path.segments.length % 2 === 0) {
            targetPoint = new Point(W * Math.random(), lastPoint.y);
        } else {
            targetPoint = new Point(lastPoint.x, H * Math.random());
        }

        // Compute how many frames the animation should take
        let duration = lastPoint.getDistance(targetPoint) / PIX_PER_FRAME;
        duration = Math.round(duration);

        createLinearMoveAnimation(duration, lastPoint, targetPoint, step, () => extendPath(path));
    }

    initializeAnimationFramework(view);

    view.on('frame', function(event) {
        // On the first frame event, start drawing the path. Two points are
        // needed to start the animation.
        if (event.count == 0) {
            for (let path of paths) {
                extendPath(path);
                extendPath(path);
            }
        }
    });

// Boilerplate ----------------------------------------------------------------
	view.draw();
// End Boilerplate ------------------------------------------------------------
}
