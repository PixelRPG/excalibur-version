import type { Blueprint } from "../../types"

// TODO generate json schema from this blueprint
const gameMenu: Blueprint = {
    "gameMenu": {
        "prpg.menu": {
            "itemEntityNames": {
                "exit": {
                    "prpg.screen-position": {},
                    "prpg.text": {
                        "content": "Exit",
                    },
                    "prpg.menu-item": {},
                },
            },
        },
        "prpg.controllable": {},
        "prpg.screen-position": {},
    }
}

export default gameMenu;