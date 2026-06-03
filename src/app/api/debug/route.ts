import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  // Simple security check
  if (secret !== 'tsukodebug123') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const report: any = {};

  try {
    report.currentDir = process.cwd();
    
    // Check Git status & latest commit
    try {
      report.gitCommit = execSync('git log -n 3 --oneline', { encoding: 'utf8' }).trim().split('\n');
      report.gitStatus = execSync('git status', { encoding: 'utf8' }).trim().split('\n');
    } catch (err: any) {
      report.gitError = err.message;
    }

    // Check directory contents
    try {
      report.files = fs.readdirSync(process.cwd());
      report.nextDirExists = fs.existsSync(path.join(process.cwd(), '.next'));
      if (report.nextDirExists) {
        report.nextFiles = fs.readdirSync(path.join(process.cwd(), '.next')).slice(0, 10);
        const buildIdPath = path.join(process.cwd(), '.next', 'BUILD_ID');
        report.hasBuildId = fs.existsSync(buildIdPath);
        if (report.hasBuildId) {
          report.buildId = fs.readFileSync(buildIdPath, 'utf8').trim();
        }
      }
    } catch (err: any) {
      report.filesError = err.message;
    }

    // Check force-build.txt and server.js
    report.forceBuildExists = fs.existsSync(path.join(process.cwd(), 'force-build.txt'));
    report.serverJsExists = fs.existsSync(path.join(process.cwd(), 'server.js'));
    if (report.serverJsExists) {
      const serverJsContent = fs.readFileSync(path.join(process.cwd(), 'server.js'), 'utf8');
      report.serverJsHasForceBuild = serverJsContent.includes('forceBuild');
      report.serverJsSnippet = serverJsContent.substring(0, 300);
    }

    // Node & Environment info
    report.nodeVersion = process.version;
    report.env = {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
    };

  } catch (globalErr: any) {
    report.globalError = globalErr.message;
  }

  return NextResponse.json(report);
}
