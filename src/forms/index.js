const popForm = ({ key, req }) => {
  if (!req.session.forms[key]) {
    return false;
  }
  const form = { ...req.session.forms[key] };
  delete req.session.forms[key];
  return form;
};

module.exports = {
  popForm,
};
