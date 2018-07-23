// Blueprint JS - Scott Krulcik 2018

const DRAW_RATE = 30; // Frames between drawing new lines

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


    const path = new Path({
        // 80% black:
        strokeColor: [0.8],
        strokeWidth: 2,
    });

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
            path.add(new Point(W, H) * Point.random());
            return;
        }

        // The new point always starts at the location of the last point, then
        // animates towards a new location
        const lastPoint = lastRealPoint(path);
        const newPoint = new Point(lastPoint.x, lastPoint.y);
        const lastIndex = path.segments.length;
        path.add(newPoint);

        let targetPoint;
        // Add odd-index points horizontal to the last point and even-index points
        // vertical to the last point
        if (path.segments.length % 2 === 0) {
            targetPoint = new Point(W * Math.random(), lastPoint.y);
        } else {
            targetPoint = new Point(lastPoint.x, H * Math.random());
        }

        // const lastSegment = path.segments[path.segments.length - 1];
        const step = function(x, y) {
            // path.segments[idx].point.x = x;
            // path.segments[idx].point.y = y;
            path.removeSegment(lastIndex);
            path.add(new Point(x, y));
            // newPoint.x = x;
            // newPoint.y = y;
            // const lastSegment = path.segments[path.segments.length - 2];
            // lastSegment.point.x = x;
            // lastSegment.point.y = y;
        }

        createLinearMoveAnimation(DRAW_RATE, lastPoint, targetPoint, step);
    }

    initializeAnimationFramework(view);

    view.on('frame', function(event) {
       if (event.count % DRAW_RATE == 0) {
           extendPath(path);
       }
    });

// Boilerplate ----------------------------------------------------------------
	view.draw();
// End Boilerplate ------------------------------------------------------------
}
