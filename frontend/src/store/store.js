import {configureStore} from  "@reduxjs/toolkit"
import providerReducer from "../slices/Provider-slice.js"
import adminReducer from "../slices/admin-slice.js"

const createStore = () => {
    return configureStore({
        reducer: {
            provider: providerReducer,
            admin: adminReducer,
        }
    })
}

export default createStore