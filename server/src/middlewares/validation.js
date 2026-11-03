import apiError from '../utils/apiError.js'

const validate = (Schema, source = 'body') => (req, res, next) => {
    const result = Schema.safeParse(req[source])

    if (!result.success) {
        return next(new apiError(400, 'Validation Error', result.error.flatten().fieldErrors))
    }

    req[source] = result.data
    next()
}

export default validate