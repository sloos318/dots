const grid = document.querySelector('.grid');

const x_max = 20;
const y_max = 25;

// Generate the grid using regular JavaScript
for (let x = 0; x < x_max; x++) {
    const row = document.createElement('div');
    row.classList.add('row');

    for (let y = 0; y < y_max; y++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');

        cell.dataset.x = x;
        cell.dataset.y = y;

        row.appendChild(cell);
    }

    grid.appendChild(row);
}

const rows = [...document.querySelectorAll('.row')];
const cells = [...document.querySelectorAll('.cell')];

let clicked = false;
let reset_all = false;

const pull_distance = 700;

const updateCellPositions = () => {
    cells.forEach((cell) => {
        const rect = cell.getBoundingClientRect();

        cell.center_position = {
            x: (rect.left + rect.right) / 2,
            y: (rect.top + rect.bottom) / 2,
        };
    });
};

const handleCellClick = (e, i) => {
    if (clicked) return;

    clicked = true;

    gsap.to('.cell', {
        duration: 1.6,
        physics2D: {
            velocity: 'random(400, 1000)',
            angle: 'random(250, 290)',
            gravity: 2000
        },
        stagger: {
            grid: [rows.length, rows[0].children.length],
            from: i,
            amount: 0.3
        },
        onComplete: function () {
            this.timeScale(-1.3);
        },
        onReverseComplete: () => {
            clicked = false;
            reset_all = true;
            handlePointerMove();
        },
    });
};

const handlePointerMove = (e = { pageX: -pull_distance, pageY: -pull_distance }) => {
    if (clicked) return;

    const { pageX: pointer_x, pageY: pointer_y } = e;

    cells.forEach((cell) => {
        const diff_x = pointer_x - cell.center_position.x;
        const diff_y = pointer_y - cell.center_position.y;

        const distance = Math.sqrt(
            diff_x * diff_x + diff_y * diff_y
        );

        if (distance < pull_distance) {
            const percent = distance / pull_distance;

            cell.pulled = true;

            gsap.to(cell, {
                zIndex: 1,
                duration: 0.2,
                x: diff_x * percent,
                y: diff_y * percent,
            });

        } else {
            if (!cell.pulled) return;

            cell.pulled = false;

            gsap.to(cell, {
                zIndex: 3,
                duration: 1,
                x: 0,
                y: 0,
                ease: "elastic.out(1, 0.3)",
            });
        }
    });

    if (reset_all) {
        reset_all = false;

        gsap.to(cells, {
            duration: 1,
            x: 0,
            y: 0,
            ease: "elastic.out(1, 0.3)",
        });
    }
};

const init = () => {
    updateCellPositions();

    window.addEventListener('resize', updateCellPositions);
    window.addEventListener('pointermove', handlePointerMove);

    document.body.addEventListener('pointerleave', () => {
        handlePointerMove();
    });

    cells.forEach((cell, i) => {
        cell.addEventListener('pointerup', (e) => {
            handleCellClick(e, i);
        });
    });
};

init();