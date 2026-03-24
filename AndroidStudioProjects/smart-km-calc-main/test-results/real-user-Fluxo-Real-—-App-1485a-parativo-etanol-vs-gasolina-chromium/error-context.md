# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - generic [ref=e3]:
    - button "Modo claro" [ref=e5] [cursor=pointer]:
      - img
    - generic [ref=e6]:
      - generic [ref=e7]:
        - img "Km por Litro" [ref=e8]
        - heading "Km por Litro" [level=1] [ref=e9]
        - paragraph [ref=e10]: Consumo e Custo de Combustível
      - generic [ref=e11]:
        - heading "Entrar" [level=3] [ref=e13]
        - generic [ref=e14]:
          - button "Continuar com Google" [ref=e15] [cursor=pointer]:
            - img
            - text: Continuar com Google
          - generic [ref=e20]: ou
          - generic [ref=e21]:
            - generic [ref=e22]:
              - text: Email
              - generic [ref=e23]:
                - img [ref=e24]
                - textbox "seu@email.com" [ref=e27]: teste.km.1774359354868@gmail.com
            - generic [ref=e28]:
              - text: Senha
              - generic [ref=e29]:
                - img [ref=e30]
                - textbox "••••••••" [ref=e33]: Teste@123456
            - button "Carregando..." [disabled]
          - paragraph [ref=e34]:
            - text: Não tem conta?
            - button "Criar conta" [ref=e35] [cursor=pointer]
```