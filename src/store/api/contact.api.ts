import simulateContactSend from "@/services/content/simulateContactSend"
import api from "@/store/api"
import type ContactMessage from "@/types/contact/ContactMessage.types"
import runQueryFn from "@/utils/runQueryFn"

const contactApi = api.injectEndpoints({
    endpoints: (build) => ({
        sendContactMessage: build.mutation<void, ContactMessage>({
            queryFn: () => runQueryFn(() => simulateContactSend())
        })
    })
})

export default contactApi
