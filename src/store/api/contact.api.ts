import simulateContactSend from "@/services/content/simulateContactSend"
import toQueryError from "@/services/content/toQueryError"
import api from "@/store/api"
import type ContactMessage from "@/types/contact/ContactMessage.types"

const contactApi = api.injectEndpoints({
    endpoints: (build) => ({
        sendContactMessage: build.mutation<void, ContactMessage>({
            queryFn: async () => {
                try {
                    await simulateContactSend()
                    return { data: undefined }
                } catch (error) {
                    return { error: toQueryError(error) }
                }
            }
        })
    })
})

export default contactApi
