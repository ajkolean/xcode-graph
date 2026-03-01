/**
 * D3 boundary force - converted to TypeScript/ES6
 * Original: rectangular boundary force from d3-force-boundary
 */
function constant(x) {
    return () => x;
}
function toAccessor(val, defaultVal) {
    return typeof val !== 'function' ? constant(val == null ? defaultVal : +val) : val;
}
function computeDefaultBorder(x0, y0, x1, y1) {
    return (Math.min((typeof x1 === 'number' ? x1 : 100) - (typeof x0 === 'number' ? x0 : -100), (typeof y1 === 'number' ? y1 : 100) - (typeof y0 === 'number' ? y0 : -100)) / 2);
}
export default function forceBoundary(x0, y0, x1, y1) {
    let strength = constant(0.1);
    let hardBoundary = true;
    let border = constant(computeDefaultBorder(x0, y0, x1, y1));
    let nodes = [];
    let strengthsX = [];
    let strengthsY = [];
    let x0z = [];
    let y0z = [];
    let x1z = [];
    let y1z = [];
    let borderz = [];
    let halfX = [];
    let halfY = [];
    let x0Fn = toAccessor(x0, -100);
    let x1Fn = toAccessor(x1, 100);
    let y0Fn = toAccessor(y0, -100);
    let y1Fn = toAccessor(y1, 100);
    function getVx(halfX, x, strengthX, _border, alpha) {
        return (halfX - x) * Math.min(2, Math.abs(halfX - x) / halfX) * strengthX * alpha;
    }
    function isNearBorder(node, i) {
        const nx = node.x ?? 0;
        const ny = node.y ?? 0;
        const bx0 = x0z[i] ?? 0;
        const bx1 = x1z[i] ?? 0;
        const by0 = y0z[i] ?? 0;
        const by1 = y1z[i] ?? 0;
        const b = borderz[i] ?? 0;
        return nx < bx0 + b || nx > bx1 - b || ny < by0 + b || ny > by1 - b;
    }
    function applyHardBoundary(node, i) {
        const nx = node.x ?? 0;
        const ny = node.y ?? 0;
        const bx0 = x0z[i] ?? 0;
        const bx1 = x1z[i] ?? 0;
        const by0 = y0z[i] ?? 0;
        const by1 = y1z[i] ?? 0;
        if (nx >= bx1)
            node.vx = (node.vx ?? 0) + (bx1 - nx);
        if (nx <= bx0)
            node.vx = (node.vx ?? 0) + (bx0 - nx);
        if (ny >= by1)
            node.vy = (node.vy ?? 0) + (by1 - ny);
        if (ny <= by0)
            node.vy = (node.vy ?? 0) + (by0 - ny);
    }
    function force(alpha) {
        for (let i = 0, n = nodes.length; i < n; ++i) {
            const node = nodes[i];
            if (node === undefined)
                continue;
            if (isNearBorder(node, i)) {
                node.vx =
                    (node.vx ?? 0) +
                        getVx(halfX[i] ?? 0, node.x ?? 0, strengthsX[i] ?? 0, borderz[i] ?? 0, alpha);
                node.vy =
                    (node.vy ?? 0) +
                        getVx(halfY[i] ?? 0, node.y ?? 0, strengthsY[i] ?? 0, borderz[i] ?? 0, alpha);
            }
            if (hardBoundary) {
                applyHardBoundary(node, i);
            }
        }
    }
    function initializeNode(i, node, strengthFn, borderFn) {
        const x0Val = +x0Fn(node, i, nodes);
        const x1Val = +x1Fn(node, i, nodes);
        const y0Val = +y0Fn(node, i, nodes);
        const y1Val = +y1Fn(node, i, nodes);
        strengthsX[i] = Number.isNaN(x0Val) || Number.isNaN(x1Val) ? 0 : +strengthFn(node, i, nodes);
        strengthsY[i] = Number.isNaN(y0Val) || Number.isNaN(y1Val) ? 0 : +strengthFn(node, i, nodes);
        x0z[i] = x0Val;
        x1z[i] = x1Val;
        y0z[i] = y0Val;
        y1z[i] = y1Val;
        halfX[i] = x0Val + (x1Val - x0Val) / 2;
        halfY[i] = y0Val + (y1Val - y0Val) / 2;
        borderz[i] = +borderFn(node, i, nodes);
    }
    function initialize() {
        if (!nodes)
            return;
        const n = nodes.length;
        strengthsX = new Array(n);
        strengthsY = new Array(n);
        x0z = new Array(n);
        y0z = new Array(n);
        x1z = new Array(n);
        y1z = new Array(n);
        halfY = new Array(n);
        halfX = new Array(n);
        borderz = new Array(n);
        const strengthFn = typeof strength === 'function' ? strength : constant(+strength);
        const borderFn = typeof border === 'function' ? border : constant(+border);
        for (let i = 0; i < n; ++i) {
            const node = nodes[i];
            if (node === undefined)
                continue;
            initializeNode(i, node, strengthFn, borderFn);
        }
    }
    force.initialize = (_) => {
        nodes = _;
        initialize();
    };
    force.x0 = (_) => {
        x0Fn = typeof _ === 'function' ? _ : constant(+_);
        initialize();
        return force;
    };
    force.x1 = (_) => {
        x1Fn = typeof _ === 'function' ? _ : constant(+_);
        initialize();
        return force;
    };
    force.y0 = (_) => {
        y0Fn = typeof _ === 'function' ? _ : constant(+_);
        initialize();
        return force;
    };
    force.y1 = (_) => {
        y1Fn = typeof _ === 'function' ? _ : constant(+_);
        initialize();
        return force;
    };
    force.strength = (_) => {
        strength = typeof _ === 'function' ? _ : constant(+_);
        initialize();
        return force;
    };
    force.border = (_) => {
        border = typeof _ === 'function' ? _ : constant(+_);
        initialize();
        return force;
    };
    force.hardBoundary = (_) => {
        hardBoundary = _;
        return force;
    };
    return force;
}
//# sourceMappingURL=boundary.js.map