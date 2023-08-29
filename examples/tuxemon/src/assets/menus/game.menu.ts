import type { Blueprint } from "../../types"

const gameMenu: Blueprint = {
    "gameMenu": {
        "prpg.menu": {
            "entityNames": {
                "exit": {
                    "prpg.menuItem": {},
                    "prpg.menuVisible": {},
                    "prpg.screenPosition": {
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "prpg.text": {
                        "text": "Exit",
                    },
                },
            }
        }
    }
}

export default gameMenu;