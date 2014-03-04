#!/usr/bin/env python
# encoding: utf-8
"""
imgsrcconv.py

Created by Na Li on 2012-09-21.
Copyright (c) 2012 __MyCompanyName__. All rights reserved.
"""

import sys
import os

def ensure_dir(f):
	d = os.path.dirname(f)
	if not os.path.exists(d):
		os.makedirs(d)
	return f
	
def main():
	try:
		f1 = open(sys.argv[1], 'r')
		file_path = ensure_dir(sys.argv[2])
		f2 = open(file_path, 'a')
		try:
			for line in f1:
				start = line.find("IMG SRC=") + 9
				end = line.find("\"", start)
				line = line.replace(line[start:end], os.path.dirname(file_path)+line[start:end])
				f2.write(line + '\n')
		finally:
			f1.close()
			f2.close()
	except IOError:
		print 'Files not found.'

if __name__ == '__main__':
	main()

