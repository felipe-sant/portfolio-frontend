import useMotion from "@/hooks/useMotion"

function usePageTransition() {
    const { motion } = useMotion()

    return motion === "full"
}

export default usePageTransition
