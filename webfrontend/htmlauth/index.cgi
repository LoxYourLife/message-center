#!/usr/bin/perl

require LoxBerry::Web;
use LoxBerry::System;
use CGI;

# This is to check if the express plugin is installed and in case it's not
# it will print an error with the hint that the message_center plugin requires
# the express plugin.

my $minRequiredVersion = "1.0.0";
my $unvalidVersion = "3.0.0";
my $version = LoxBerry::System::pluginversion("express");

if ($version && $version ge $minRequiredVersion && $version lt $unvalidVersion) {
    my $q = CGI->new;
    print $q->header(-status => 307, -location => '/admin/express/plugins/message_center');
    exit(0);
}

my $template = HTML::Template->new(
    filename => "$lbptemplatedir/error.html",
    global_vars => 1,
    loop_context_vars => 1,
    die_on_bad_params => 0,
);
$template->param( REQUIRED_VERSION => $minRequiredVersion);
$template->param( MAX_VERSION => $unvalidVersion);

%L = LoxBerry::System::readlanguage($template, "language.ini");
LoxBerry::Web::lbheader("Message Center", "", "");
print $template->output();
LoxBerry::Web::lbfooter();

