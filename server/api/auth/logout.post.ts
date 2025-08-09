export default defineEventHandler(async (event) => {
  try {
    // Clear the refresh token cookie
    setCookie(event, 'refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 // Expire immediately
    })

    return {
      success: true,
      message: 'Logged out successfully'
    }

  } catch (error: any) {
    console.error('Logout error:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
