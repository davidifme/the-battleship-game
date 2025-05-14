import { describe, expect, it } from "vitest";
import { Ship } from "../ship";

describe('Ship Functions', () => {
    it('creates a ship object', () => {
        const ship = Ship.create(5)

        expect(ship).toBeTypeOf('object')
    })
})