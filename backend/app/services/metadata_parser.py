import yaml
import re
from typing import Dict, Any, Optional

def parse_script_metadata(content: str) -> Optional[Dict[str, Any]]:
    """
    Parse YAML metadata from script content.
    Expects format:
    # ---
    # name: script-name
    # description: Script description
    # inputs:
    #   var1: description
    # ---
    """
    # Look for YAML front matter in comments
    pattern = r'^#\s*---\n((?:#.*\n)*?)#\s*---'
    match = re.search(pattern, content, re.MULTILINE)
    
    if not match:
        return None
    
    yaml_content = match.group(1)
    # Remove comment prefixes from each line
    yaml_lines = []
    for line in yaml_content.split('\n'):
        if line.strip().startswith('#'):
            # Remove the # and preserve the indentation
            cleaned_line = line.strip()[1:]
            if cleaned_line.startswith(' '):
                yaml_lines.append(cleaned_line[1:])  # Remove one space after #
            else:
                yaml_lines.append(cleaned_line)
        elif line.strip() == '':
            yaml_lines.append('')
    
    yaml_text = '\n'.join(yaml_lines)
    
    try:
        metadata = yaml.safe_load(yaml_text)
        return metadata
    except yaml.YAMLError:
        return None

def create_sample_script_content() -> str:
    """Create sample script content with metadata"""
    return '''# ---
# name: hello-world
# description: A simple hello world script
# inputs:
#   message: The message to display
# ---

#!/bin/bash
echo "Hello, ${message:-World}!"
echo "Script executed at: $(date)"'''