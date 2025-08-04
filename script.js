function applyCorsFix(yamlString) {
  // Very basic stub detection and patching (works for one GET method block)
  let patched = yamlString;
  let changes = [];

  const corsMethodResponses = `
    MethodResponses:
      - StatusCode: 200
        ResponseParameters:
          method.response.header.Access-Control-Allow-Origin: true
          method.response.header.Access-Control-Allow-Headers: true
          method.response.header.Access-Control-Allow-Methods: true`;

  const corsIntegrationResponses = `
    IntegrationResponses:
      - StatusCode: 200
        ResponseParameters:
          method.response.header.Access-Control-Allow-Origin: "'*'"
          method.response.header.Access-Control-Allow-Headers: "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
          method.response.header.Access-Control-Allow-Methods: "'GET'"
        ResponseTemplates:
          application/json: ""`;

  const insertCorsBlocks = (sectionName, corsBlock) => {
    const regex = new RegExp(`(${sectionName}:\\s*\\n(?:[ ]{2,}[^\n]*\\n)+)`, 'gm');
    patched = patched.replace(regex, (match) => {
      if (!match.includes('Access-Control-Allow-Origin')) {
        changes.push(sectionName);
        return match + '\n' + corsBlock + '\n';
      }
      return match;
    });
  };

  // Insert blocks into method if missing
  insertCorsBlocks('GetMethod', corsIntegrationResponses);
  insertCorsBlocks('GetMethod', corsMethodResponses);

  // Highlight inserted lines (optional: if used in HTML output)
  changes.forEach((block) => {
    patched = patched.replace(
      corsMethodResponses.trim(),
      `<span class="highlight-added">${corsMethodResponses.trim()}</span>`
    );
    patched = patched.replace(
      corsIntegrationResponses.trim(),
      `<span class="highlight-added">${corsIntegrationResponses.trim()}</span>`
    );
  });

  return patched;
}