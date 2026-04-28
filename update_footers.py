import re
import glob
import os

# Files to update
files = glob.glob('../preview*.html') + ['app/page.tsx', 'app/system/page.tsx']
print("Target files:", files)

footer_html = """<!-- FOOTER -->
  <footer class="py-16 px-10 md:px-24 bg-[#0f141b] flex flex-col md:flex-row items-center justify-between border-t border-[#2d3a4b] text-[9px] font-mono tracking-[0.2em] uppercase text-gray-500 gap-8">
    <div class="flex-1 flex justify-center md:justify-start w-full md:w-auto">
      <p>&copy; 2026 Zana Fitness</p>
    </div>
    <div class="flex-1 flex justify-center py-6 md:py-0">
      <svg viewBox="0 0 180 32" class="h-4 md:h-5 text-white" fill="none" stroke="currentColor" stroke-width="5" stroke-miterlimit="10"><path d="M0,2 H32 L18.3,14" /><path d="M13.7,18 L0,30 H32" /><path d="M48,30 L64,2 L80,30" /><path d="M96,30 V2 L128,30 V2" /><path d="M144,30 L160,2 L176,30" /></svg>
    </div>
    <div class="flex-1 flex justify-center md:justify-end gap-5 w-full md:w-auto">
      <a href="https://www.instagram.com/javi_zana/" target="_blank" class="hover:text-white transition-colors">Instagram</a>
      <a href="https://www.tiktok.com/@javi_zana?lang=en" target="_blank" class="hover:text-white transition-colors">TikTok</a>
    </div>
  </footer>"""

footer_tsx = """{/* FOOTER */}
      <footer className="py-16 px-10 md:px-24 bg-[#0f141b] flex flex-col md:flex-row items-center justify-between border-t border-[#2d3a4b] text-[9px] font-mono tracking-[0.2em] uppercase text-gray-500 gap-8">
        <div className="flex-1 flex justify-center md:justify-start w-full md:w-auto">
          <p>&copy; 2026 Zana Fitness</p>
        </div>
        <div className="flex-1 flex justify-center py-6 md:py-0">
          <ZanaLogo className="h-4 md:h-5 text-white" />
        </div>
        <div className="flex-1 flex justify-center md:justify-end gap-5 w-full md:w-auto">
          <a href="https://www.instagram.com/javi_zana/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
          <a href="https://www.tiktok.com/@javi_zana?lang=en" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">TikTok</a>
        </div>
      </footer>"""

for filepath in files:
    try:
        with open(filepath, 'r') as f:
            content = f.read()

        if filepath.endswith('.tsx'):
            new_content = re.sub(r'\{\/\*\s*FOOTER\s*\*\/\}.*?<\/footer>', footer_tsx, content, flags=re.DOTALL)
        else:
            new_content = re.sub(r'<\!--\s*FOOTER\s*-->.*?<\/footer>', footer_html, content, flags=re.DOTALL)
            
        with open(filepath, 'w') as f:
            f.write(new_content)
            
        print("Successfully updated footer in:", filepath)
    except Exception as e:
        print("Error on", filepath, e)
