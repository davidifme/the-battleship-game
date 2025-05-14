export const Ship = (function() {

    function create(length) {
        return {
            length,
            hits: 0,
            isSunk() {
                return this.hits >= length
            },
            hit() {
                this.hits++
            }
        }
    }

    return {
        create
    }
})()