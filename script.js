window.onload = () => {
  const originSelect = document.getElementById("originSelect");
  originSelect.value = localStorage.getItem("corsOrigin") || "*";
  originSelect.onchange = () =>
    localStorage.setItem("corsOrigin", originSelect.value);
};

function getCorsMethodResponses() {
  return `MethodResponses:
    - StatusCode: 200
      ResponseParameters:
        method.response.header.Access-Control-Allow-Origin: true
        method.response.header.Access-Control-Allow-Headers: true
        method.response.header.Access-Control-Allow-Methods: true`;
}

function getCorsIntegrationResponses(origin) {
  return `IntegrationResponses:
    - StatusCode: 200
      ResponseParameters:
        method.response.header.Access-Control-Allow-Origin: "'${origin}'"
        method.response.header.Access-Control-Allow-Headers: "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
        method.response.header.Access-Control-Allow-Methods: "'GET'"
      ResponseTemplates:
        application/json: ""`;
}

function highlightBlock(block) {
  return `<span class="highlight-added">${block}</span>`;
}

function runCorsFix() {
  const input = document.getElementById("yamlInput").value;
  const origin = document.getElementById("originSelect").value;

  let patched = input;

  if (!input.includes("MethodResponses")) {
    patched += `\n${highlightBlock(getCorsMethodResponses())}`;
  }

  if (!input.includes("IntegrationResponses")) {
    patched += `\n${highlightBlock(getCorsIntegrationResponses(origin))}`;
  }

  document.getElementById("yamlOutput").innerHTML = patched;
}