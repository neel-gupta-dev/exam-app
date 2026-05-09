import re

with open('server/src/controllers/publicController.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'const data = req\.body;\s*// Create new lead document\s*const lead = new PredictorLead\(\{\s*\.\.\.data,',
    '''const data = req.body;
    
    const allowedFields = ['name', 'jee_mains_rank', 'jee_advanced_rank', 'bitsat_score', 'category', 'gender', 'home_state', 'is_pwd', 'round', 'branch_preferences', 'use_market_ranking', 'college_preferences', 'results_summary', 'device_info'];
    const safeData = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) safeData[field] = data[field];
    }
    
    // Create new lead document
    const lead = new PredictorLead({
      ...safeData,''',
    content
)

content = re.sub(
    r"const targetUrl = url\.startsWith\('http'\) \? url : `https://\$\{url\}`;\s*const response = await fetch\(targetUrl, \{",
    '''const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // SSRF Mitigation
    try {
      const parsedUrl = new URL(targetUrl);
      const hostname = parsedUrl.hostname;
      
      const isLocalhost = hostname === 'localhost' || hostname.endsWith('.localhost');
      const isLoopback = hostname.startsWith('127.');
      const isPrivateA = hostname.startsWith('10.');
      const isPrivateB = /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);
      const isPrivateC = hostname.startsWith('192.168.');
      const isAWSMetadata = hostname === '169.254.169.254';
      
      if (isLocalhost || isLoopback || isPrivateA || isPrivateB || isPrivateC || isAWSMetadata) {
        return res.status(403).json({ message: 'Fetching metadata from private or local addresses is strictly prohibited.' });
      }
    } catch (e) {
      return res.status(400).json({ message: 'Invalid URL format' });
    }

    const response = await fetch(targetUrl, {''',
    content
)

with open('server/src/controllers/publicController.js', 'w', encoding='utf-8') as f:
    f.write(content)
