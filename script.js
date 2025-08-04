// PATCH ENGINE
function patchMethodResponses(yaml) {
  return yaml.replace(
    /(MethodResponses:\n(?:[\s\S]*?)-\s*StatusCode:\s*200)/g,
    `$1\n          ResponseParameters:\n            method.response.header.Access-Control-Allow-Origin: true`
  );
}

function patchIntegrationResponses(yaml, origin = "'*'") {
  return yaml.replace(
    /(Integration:\n[\s\S]*?IntegrationResponses:\n[\s\S]*?- StatusCode: 200)/g,
    `$1\n            ResponseParameters:\n              method.response.header.Access-Control-Allow-Origin: ${JSON.stringify(origin)}`
  );
}

// YAML VALIDATOR
function validateYAML(yaml) {
  const hasMethod = yaml.includes('MethodResponses:');
  const hasIntegration = yaml.includes('IntegrationResponses:');
  if (!hasMethod || !hasIntegration) {
    alert("Warning: YAML may be missing required blocks like 'MethodResponses' or 'IntegrationResponses'");
  }
}

// UI CONTROLLER
function fixCORS() {
  const input = document.getElementById('yamlInput').value;
  const origin = document.getElementById('originSelect').value || '*';
  let output = input;

  validateYAML(input);
  output = patchMethodResponses(output);
  output = patchIntegrationResponses(output, origin);

  document.getElementById('output').textContent = output;
}

function refreshFields() {
  document.getElementById('yamlInput').value = '';
  document.getElementById('output').textContent = '';
  document.getElementById('originSelect').value = '*';
}

function loadFile(event) {
  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('yamlInput').value = e.target.result;
  };
  reader.readAsText(event.target.files[0]);
}