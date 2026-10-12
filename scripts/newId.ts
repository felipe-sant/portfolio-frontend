import generateUuidV7 from "@/services/content/generateUuidV7"

const count = Number(process.argv[2] ?? "1")

if (!Number.isInteger(count) || count < 1) {
    throw new Error("Quantidade inválida: use um inteiro maior que zero.")
}

for (let index = 0; index < count; index += 1) {
    console.log(generateUuidV7())
}
