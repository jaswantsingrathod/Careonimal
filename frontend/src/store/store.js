import {configureStore} from  "@reduxjs/toolkit"
import {providerReducer, providerUiReducer } from "../slices/Provider-slice.js"
import adminReducer from "../slices/admin-slice.js"
import nearbyReducer from "../slices/nearby-slice.js"
import bookingReducer from "../slices/booking-slice.js"
import subscriptionReducer from "../slices/subscription-slice.js"
import reviewReducer from "../slices/Review-slice.js"

const createStore = () => {
    return configureStore({
        reducer: {
            provider: providerReducer,
            providerUi: providerUiReducer,
            admin: adminReducer,
            nearby: nearbyReducer,
            booking: bookingReducer,
            subscription: subscriptionReducer,
            review: reviewReducer,
        }
    })
}

export default createStore