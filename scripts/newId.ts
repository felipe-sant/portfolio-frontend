import generateUuidV7 from "@/services/content/generateUuidV7"

const requested = Number(process.argv[2] ?? "1")
const count = Number.isInteger(requested) && requested > 0 ? requested : 1

for (let index = 0; index < count; index += 1) {
    console.log(generateUuidV7())
}
