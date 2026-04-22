describe('Inicio de Sesión', () => {

  beforeEach(() => {
    cy.visit('/')
  })

  it('Login válido redirige a /dashboard', () => {
    cy.get('input[type="email"]').type('test2@ejemplo.com')
    cy.get('input[type="password"]').type('123456')

    cy.get('form').submit()

    cy.url().should('include', '/dashboard')
  })

})