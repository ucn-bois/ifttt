$('form').on('submit', ({ target: form }) => {
  $(form).find('button[type=submit]').prop('disabled', true);
});

$('.toast').toast({
  animation: false,
  delay: 5000,
}).toast('show');
