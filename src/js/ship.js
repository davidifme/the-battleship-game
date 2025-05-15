export const Ship = (function() {

    function create(length) {
        return {
            position: {
                x: null,
                y: null
            },
            notHitCells: [],
            hitCells: [],
            length,
            hits: 0,
            hit(row, column) {
                for (let j = 0; j < this.hitCells.length; j++) {
                    const hitCell = this.hitCells[j];
                    if (hitCell[0] === row && hitCell[1] === column) {
                        return;
                    }
                }
                
                for (let i = 0; i < this.notHitCells.length; i++) {
                    const notHitCell = this.notHitCells[i];
                    if (notHitCell[0] === row && notHitCell[1] === column) {
                        this.hitCells.push(notHitCell);
                        this.notHitCells.splice(i, 1);
                        this.hits++;
                        return;
                    }
                }
            },
            isSunk() {
                return this.hits >= length
            }
        }
    }

    return {
        create
    }
})()