<?php

namespace Bolt\Extension\Bolt\RSSFeed;

use Bolt\Application;
use Symfony\Component\HttpFoundation\Response;

/**
 * RSSFeed Controller
 *
 * @author Patrick van Kouteren <info@wedesignit.nl>
 * @author Gawain Lynch <gawain.lynch@gmail.com>
 */
class Controller
{
    /** @var Silex\Application $app */
    private $app;

    /** @var array $config Extension config  */
    private $config;

    public function __construct(Application $app)
    {
        $this->app = $app;
        $this->config = $this->app['extensions.' . Extension::NAME]->config;
    }

    public function feed($contenttypeslug = '')
    {
        // jQuery not required
        $this->app['extensions']->disableJquery();

        // Clear snippet list. There's no clear any more, so just set to null
        $this->app['extensions']->clearSnippetQueue();
        $this->app['debugbar'] = false;

        // Defaults for later
        $defaultFeedRecords = 5;
        $defaultTemplate = 'rss.twig';
        $content = array();
        $contenttypes = array();

        // If we're on the front page, use sitewide configuration
        if ($contenttypeslug == '') {
            $contenttypeslug = 'sitewide';
        }

        if (!isset($this->config[$contenttypeslug]['enabled']) ||
            $this->config[$contenttypeslug]['enabled'] != 'true'
        ) {
            $this->app->abort(404, "Feed for '$contenttypeslug' not found.");
        }

        // Better safe than sorry: abs to prevent negative values
        $amount = (int) abs((!empty($this->config[$contenttypeslug]['feed_records']) ?
            $this->config[$contenttypeslug]['feed_records'] : $defaultFeedRecords));
        // How much to display in the description. Value of 0 means full body!
        $contentLength = (int) abs(
            (!empty($this->config[$contenttypeslug]['content_length']) ?
                $this->config[$contenttypeslug]['content_length'] :
                0)
        );

        // Get our content
        if ($contenttypeslug == 'sitewide') {
            foreach ($this->config[$contenttypeslug]['content_types'] as $types) {
                $contenttypes[] = $this->app['storage']->getContentType($types);
            }
        } else {
            $contenttypes[] = $this->app['storage']->getContentType($contenttypeslug);
        }

        // Get content for each contenttype we've selected as an assoc. array
        // by content type
        foreach ($contenttypes as $contenttype) {
            $content[$contenttype['slug']] = $this->app['storage']->getContent(
                $contenttype['slug'],
                array('limit' => $amount, 'order' => 'datepublish desc')
            );
        }

        // Now narrow our content array to $amount based on date
        $tmp = array();
        foreach ($content as $slug => $recordid) {
            if (!empty($recordid)) {
                foreach ($recordid as $record) {
                    $key = strtotime($record->values['datepublish']) . $slug;
                    $tmp[$key] = $record;
                }
            }
        }

        // Sort the array and return a reduced one
        krsort($tmp);
        $content = array_slice($tmp, 0, $amount);

        if (!$content) {
            $this->app->abort(404, "Feed for '$contenttypeslug' not found.");
        }

        // Then, select which template to use, based on our
        // 'cascading templates rules'
        if (!empty($this->config[$contenttypeslug]['feed_template'])) {
            $template = $this->config[$contenttypeslug]['feed_template'];
        } else {
            $template = $defaultTemplate;
        }

        $this->app['twig.loader.filesystem']->addPath(dirname(__DIR__) . '/assets/');

        $body = $this->app['render']->render($template, array(
            'records'            => $content,
            'content_length'     => $contentLength,
            $contenttype['slug'] => $content,
        ));

        $response = new Response($body, Response::HTTP_OK);
        $response->setCharset('utf-8')
            ->setPublic()
            ->setSharedMaxAge(3600)
            ->headers->set('Content-Type', 'application/rss+xml');

        return $response;
    }
}
