import type Profile from "@/types/profile/Profile.types"

type AboutProfileState = {
    data: Profile | undefined
    isLoading: boolean
    isError: boolean
    retry: () => void
}

export default AboutProfileState
