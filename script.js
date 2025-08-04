function applyCorsFix(yamlString) {
  let patched = yamlString;
  let changes = [];

  const corsMethodResponses = `MethodResponses:
    - StatusCode: 200
      ResponseParameters:
        method.response.header.Access-Control-Allow-Origin: true
        method.response.header.Access-Control-Allow-Headers: true
        method.response.header.Access-Control-Allow-Methods: true`;

  const corsIntegrationResponses = `IntegrationResponses:
    - StatusCode: 200
      ResponseParameters:
        method.response.header.Access-Control-Allow-Origin: "'*'"
        method.response.header.Access-Control-Allow-Headers: "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
        method.response.header.Access-Control-Allow-Methods: "'GET'"
      ResponseTemplates:
        application/json: ""`;

  const methodRegex = /^(\s*)(\w+):\s*\n(\1\s{2}Type: AWS::ApiGateway::Method[\s\S]+?)(\1\s{2}Properties:\s*\n)((?:\1\s{4}.+\n)*)(?!\1\s{4}MethodResponses)/gm;

  patched = patched.replace(methodRegex, (match, indent, methodName, blockStart, propStart, propsBlock) => {
    const ind4 = indent + '   ';

    const highlightedMethodResponses = `<span class="highlight-added">\n${ind4}${corsMethodResponses.replace(/\n/g, `\n${ind4}`)}\n</span>`;
    const highlightedIntegrationResponses = `<span class="highlight-added">\n${ind4}${corsIntegrationResponses.replace(/\n/g, `\n${ind4}`)}\n</span>`;

    let newPropsBlock = propsBlock;
    let didPatch = false;

    if (!propsBlock.includes('IntegrationResponses')) {
      newPropsBlock += `\n${highlightedIntegrationResponses}\n`;
      didPatch = true;
    }

    if (!propsBlock.includes('MethodResponses')) {
      newPropsBlock += `\n${highlightedMethodResponses}\n`;
      didPatch = true;
    }

    if (didPatch) {
      changes.push(methodName);
    }

    return `${indent}${methodName}:\n${blockStart}${propStart}${newPropsBlock}`;
  });

  return patched;
}