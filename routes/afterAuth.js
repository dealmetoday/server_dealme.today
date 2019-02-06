const afterAuth = (user) => `
  <!DOCTYPE html>
  <html>
    <script type="text/javascript">  
    if (window.opener) {
        window.opener.focus();
        if (window.opener.app && window.opener.app.authState) {
            window.opener.app.authState(state, user);
        }
    }
    window.close();
</script>  
  </html>
`;

export default afterAuth;